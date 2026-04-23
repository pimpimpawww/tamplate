import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Permissions } from '@/lib/permissions'
import { LabaRugiTable } from './LabaRugiTable'

function formatRupiah(n: number | string) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(n))
}

export default async function LabaRugiPage() {
  const session = await verifySession()
  if (!session) redirect('/login')
  if (!Permissions.canViewFinancials(session.role)) redirect('/dashboard/pos')

  const projects = await prisma.project.findMany({
    where: { status: { in: ['AKTIF', 'SELESAI'] } },
    include: {
      customer: true,
      contract: {
        include: {
          termins: { where: { status: 'LUNAS' } },
          expenses: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const data = projects
    .filter(p => p.contract)
    .map(p => {
      const pendapatan = p.contract!.termins.reduce((s, t) => s + Number(t.jumlah), 0)
      const biaya = p.contract!.expenses.reduce((s, e) => s + Number(e.jumlah), 0)
      return { project: { id: p.id, namaProyek: p.namaProyek, status: p.status, customer: { nama: p.customer.nama } }, pendapatan, biaya, laba: pendapatan - biaya }
    })

  const totalPendapatan = data.reduce((s, d) => s + d.pendapatan, 0)
  const totalBiaya = data.reduce((s, d) => s + d.biaya, 0)
  const totalLaba = totalPendapatan - totalBiaya

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/pos">
          <button className="p-2 rounded-lg border hover:bg-gray-50"><ArrowLeft className="h-4 w-4" /></button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Laporan Laba Rugi</h1>
          <p className="text-sm text-muted-foreground">{data.length} proyek dengan kontrak</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-lg" style={{ background: '#1e2328' }}>
          <p className="text-xs" style={{ color: '#a8b89a' }}>Total Pendapatan</p>
          <p className="text-xl font-bold" style={{ color: '#86efac' }}>{formatRupiah(totalPendapatan)}</p>
        </div>
        <div className="p-4 rounded-lg" style={{ background: '#1e2328' }}>
          <p className="text-xs" style={{ color: '#a8b89a' }}>Total Biaya</p>
          <p className="text-xl font-bold" style={{ color: '#f87171' }}>{formatRupiah(totalBiaya)}</p>
        </div>
        <div className="p-4 rounded-lg" style={{ background: '#1e2328' }}>
          <p className="text-xs" style={{ color: '#a8b89a' }}>Laba Kotor</p>
          <p className="text-xl font-bold" style={{ color: totalLaba >= 0 ? '#a8b89a' : '#f87171' }}>{formatRupiah(totalLaba)}</p>
        </div>
      </div>
      <LabaRugiTable data={data} />
    </div>
  )
}
