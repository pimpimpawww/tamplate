import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'

export async function GET() {
  const session = await verifySession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Pendapatan 6 bulan terakhir (termin LUNAS)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  sixMonthsAgo.setDate(1)
  sixMonthsAgo.setHours(0, 0, 0, 0)

  const lunasByMonth = await prisma.paymentTerm.findMany({
    where: { status: 'LUNAS', tanggalBayar: { gte: sixMonthsAgo } },
    select: { jumlah: true, tanggalBayar: true },
  })

  // Biaya per bulan
  const expensesByMonth = await prisma.expense.findMany({
    where: { tanggal: { gte: sixMonthsAgo } },
    select: { jumlah: true, tanggal: true },
  })

  // Build 6-month chart data
  const months: Record<string, { bulan: string; pendapatan: number; biaya: number }> = {}
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
    months[key] = { bulan: label, pendapatan: 0, biaya: 0 }
  }

  lunasByMonth.forEach(t => {
    if (!t.tanggalBayar) return
    const d = new Date(t.tanggalBayar)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (months[key]) months[key].pendapatan += Number(t.jumlah)
  })

  expensesByMonth.forEach(e => {
    const d = new Date(e.tanggal)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (months[key]) months[key].biaya += Number(e.jumlah)
  })

  // Piutang (termin belum lunas yang sudah ditagih)
  const piutang = await prisma.paymentTerm.aggregate({
    where: { status: 'MENUNGGU_PEMBAYARAN' },
    _sum: { jumlah: true },
    _count: true,
  })

  // Proyek aktif
  const proyekAktif = await prisma.project.count({ where: { status: 'AKTIF' } })

  return NextResponse.json({
    chartData: Object.values(months),
    piutang: { total: Number(piutang._sum.jumlah ?? 0), count: piutang._count },
    proyekAktif,
  })
}
