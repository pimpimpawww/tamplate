import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Permissions } from '@/lib/permissions'
import { PiutangTable } from './PiutangTable'

function formatRupiah(n: number | string) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(n))
}

export default async function RekapPiutangPage() {
  const session = await verifySession()
  if (!session) redirect('/login')
  if (!Permissions.canViewFinancials(session.role)) redirect('/dashboard/pos')

  const termins = await prisma.paymentTerm.findMany({
    where: { status: 'MENUNGGU_PEMBAYARAN' },
    include: { contract: { include: { project: { include: { customer: true } } } } },
    orderBy: { tanggalTagih: 'asc' },
  })

  const total = termins.reduce((s, t) => s + Number(t.jumlah), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/pos">
          <button className="p-2 rounded-lg border hover:bg-gray-50"><ArrowLeft className="h-4 w-4" /></button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Rekap Piutang</h1>
          <p className="text-sm text-muted-foreground">{termins.length} termin menunggu pembayaran</p>
        </div>
      </div>
      <div className="p-4 rounded-lg" style={{ background: '#1e2328' }}>
        <p className="text-xs" style={{ color: '#a8b89a' }}>Total Piutang</p>
        <p className="text-2xl font-bold" style={{ color: '#fbbf24' }}>{formatRupiah(total)}</p>
      </div>
      <PiutangTable data={termins.map(t => ({
        id: t.id,
        namaTermin: t.namaTermin,
        jumlah: String(t.jumlah),
        tanggalTagih: t.tanggalTagih?.toISOString() ?? null,
        contract: {
          project: {
            id: t.contract.project.id,
            namaProyek: t.contract.project.namaProyek,
            customer: { nama: t.contract.project.customer.nama },
          },
        },
      }))} />
    </div>
  )
}
