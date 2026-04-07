import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { FileText, Users, Package, TrendingUp, CheckCircle, AlertTriangle, Lock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RevenueChart } from '@/components/pos/RevenueChart'
import { Permissions } from '@/lib/permissions'

function formatRupiah(n: number | string) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(n))
}

async function getChartData() {
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  sixMonthsAgo.setDate(1)
  sixMonthsAgo.setHours(0, 0, 0, 0)

  const [lunas, expenses] = await Promise.all([
    prisma.paymentTerm.findMany({
      where: { status: 'LUNAS', tanggalBayar: { gte: sixMonthsAgo } },
      select: { jumlah: true, tanggalBayar: true },
    }),
    prisma.expense.findMany({
      where: { tanggal: { gte: sixMonthsAgo } },
      select: { jumlah: true, tanggal: true },
    }),
  ])

  const months: Record<string, { bulan: string; pendapatan: number; biaya: number }> = {}
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    months[key] = { bulan: d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }), pendapatan: 0, biaya: 0 }
  }
  lunas.forEach(t => {
    if (!t.tanggalBayar) return
    const d = new Date(t.tanggalBayar)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (months[key]) months[key].pendapatan += Number(t.jumlah)
  })
  expenses.forEach(e => {
    const d = new Date(e.tanggal)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (months[key]) months[key].biaya += Number(e.jumlah)
  })
  return Object.values(months)
}

export default async function POSDashboardPage() {
  const session = await verifySession()
  if (!session) redirect('/login')

  const canViewFinancials = Permissions.canViewFinancials(session.role)

  const [proyekAktif, totalPelanggan, termins, expenses, chartData, piutangData] = await Promise.all([
    prisma.project.count({ where: { status: 'AKTIF' } }),
    prisma.customer.count(),
    canViewFinancials ? prisma.paymentTerm.findMany({ select: { status: true, jumlah: true } }) : Promise.resolve([]),
    canViewFinancials ? prisma.expense.aggregate({ _sum: { jumlah: true } }) : Promise.resolve({ _sum: { jumlah: null } }),
    canViewFinancials ? getChartData() : Promise.resolve([]),
    canViewFinancials ? prisma.paymentTerm.aggregate({
      where: { status: 'MENUNGGU_PEMBAYARAN' },
      _sum: { jumlah: true },
      _count: true,
    }) : Promise.resolve({ _sum: { jumlah: null }, _count: 0 }),
  ])

  const totalLunas = termins.filter(t => t.status === 'LUNAS').reduce((s, t) => s + Number(t.jumlah), 0)
  const totalBiaya = Number(expenses._sum.jumlah ?? 0)
  const totalPiutang = Number(piutangData._sum.jumlah ?? 0)
  const labaKotor = totalLunas - totalBiaya

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black uppercase tracking-wide" style={{ color: '#1e2328' }}>Dashboard POS</h1>
        <p className="text-sm mt-0.5" style={{ color: '#6b7c4a' }}>Fidyatama Design, Build, and Demolis Contractor</p>
      </div>

      {/* KPI Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Proyek Aktif — semua role bisa lihat */}
        <Card className="border-0 shadow-sm" style={{ borderLeft: '4px solid #6b7c4a', background: '#1e2328' }}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs" style={{ color: '#a8b89a' }}>Proyek Aktif</p>
                <p className="text-2xl font-bold text-white">{proyekAktif}</p>
              </div>
              <FileText className="h-8 w-8 opacity-20 text-white" />
            </div>
          </CardContent>
        </Card>

        {/* Piutang — hanya OWNER */}
        <Card className="border-0 shadow-sm" style={{ borderLeft: `4px solid ${canViewFinancials ? '#d97706' : '#4a5568'}`, background: '#1e2328' }}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs" style={{ color: '#a8b89a' }}>Total Piutang</p>
                {canViewFinancials ? (
                  <>
                    <p className="text-base font-bold" style={{ color: '#fbbf24' }}>{formatRupiah(totalPiutang)}</p>
                    <p className="text-xs" style={{ color: '#6b7c4a' }}>{piutangData._count} termin menunggu</p>
                  </>
                ) : (
                  <div className="flex items-center gap-1 mt-1"><Lock className="h-3 w-3" style={{ color: '#4a5568' }} /><span className="text-xs" style={{ color: '#4a5568' }}>Hanya Owner</span></div>
                )}
              </div>
              <AlertTriangle className="h-8 w-8 opacity-20 text-white" />
            </div>
          </CardContent>
        </Card>

        {/* Total Lunas — hanya OWNER */}
        <Card className="border-0 shadow-sm" style={{ borderLeft: `4px solid ${canViewFinancials ? '#22c55e' : '#4a5568'}`, background: '#1e2328' }}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs" style={{ color: '#a8b89a' }}>Total Lunas</p>
                {canViewFinancials ? (
                  <p className="text-base font-bold" style={{ color: '#86efac' }}>{formatRupiah(totalLunas)}</p>
                ) : (
                  <div className="flex items-center gap-1 mt-1"><Lock className="h-3 w-3" style={{ color: '#4a5568' }} /><span className="text-xs" style={{ color: '#4a5568' }}>Hanya Owner</span></div>
                )}
              </div>
              <CheckCircle className="h-8 w-8 opacity-20 text-white" />
            </div>
          </CardContent>
        </Card>

        {/* Laba Kotor — hanya OWNER */}
        <Card className="border-0 shadow-sm" style={{ borderLeft: `4px solid ${canViewFinancials ? (labaKotor >= 0 ? '#6b7c4a' : '#ef4444') : '#4a5568'}`, background: '#1e2328' }}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs" style={{ color: '#a8b89a' }}>Laba Kotor</p>
                {canViewFinancials ? (
                  <>
                    <p className="text-base font-bold" style={{ color: labaKotor >= 0 ? '#a8b89a' : '#f87171' }}>{formatRupiah(labaKotor)}</p>
                    <p className="text-xs" style={{ color: '#4a5568' }}>Biaya: {formatRupiah(totalBiaya)}</p>
                  </>
                ) : (
                  <div className="flex items-center gap-1 mt-1"><Lock className="h-3 w-3" style={{ color: '#4a5568' }} /><span className="text-xs" style={{ color: '#4a5568' }}>Hanya Owner</span></div>
                )}
              </div>
              <TrendingUp className="h-8 w-8 opacity-20 text-white" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart — hanya OWNER */}
      {canViewFinancials ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-0 shadow-sm" style={{ background: '#1e2328' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#a8b89a' }}>
                Pendapatan vs Biaya — 6 Bulan Terakhir
              </CardTitle>
            </CardHeader>
            <CardContent><RevenueChart data={chartData} /></CardContent>
          </Card>
          <Card className="border-0 shadow-sm" style={{ background: '#1e2328' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2" style={{ color: '#a8b89a' }}>
                <AlertTriangle className="h-4 w-4" style={{ color: '#fbbf24' }} /> Piutang Aktif
              </CardTitle>
            </CardHeader>
            <CardContent>
              {totalPiutang > 0 ? (
                <div className="space-y-3">
                  <div className="text-center py-4">
                    <p className="text-2xl font-bold" style={{ color: '#fbbf24' }}>{formatRupiah(totalPiutang)}</p>
                    <p className="text-xs mt-1" style={{ color: '#6b7c4a' }}>{piutangData._count} termin belum dibayar</p>
                  </div>
                  <Link href="/dashboard/pos/projects">
                    <div className="text-center text-xs py-2 rounded-lg cursor-pointer" style={{ color: '#a8b89a', background: 'rgba(107,124,74,0.15)' }}>
                      Lihat semua proyek →
                    </div>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2" style={{ color: '#6b7c4a' }} />
                  <p className="text-sm" style={{ color: '#4a5568' }}>Tidak ada piutang</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-0 shadow-sm" style={{ background: '#1e2328', borderLeft: '4px solid #4a5568' }}>
          <CardContent className="py-6 flex items-center gap-3">
            <Lock className="h-8 w-8 shrink-0" style={{ color: '#4a5568' }} />
            <div>
              <p className="font-semibold text-white">Laporan Keuangan</p>
              <p className="text-sm" style={{ color: '#4a5568' }}>Grafik pendapatan, piutang, dan laba kotor hanya dapat dilihat oleh Owner.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions — sesuai permission */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Permissions.canCreateProject(session.role) && (
          <Link href="/dashboard/pos/projects/new">
            <div className="flex items-center gap-3 p-4 rounded-lg border border-dashed transition-all cursor-pointer hover:border-[#6b7c4a] hover:bg-[#6b7c4a]/5" style={{ borderColor: '#d1d5db' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#6b7c4a' }}>
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: '#1e2328' }}>Buat Proyek Baru</p>
                <p className="text-xs" style={{ color: '#9ca3af' }}>Mulai proyek & kontrak</p>
              </div>
            </div>
          </Link>
        )}
        <Link href="/dashboard/pos/projects">
          <div className="flex items-center gap-3 p-4 rounded-lg border border-dashed transition-all cursor-pointer hover:border-[#6b7c4a] hover:bg-[#6b7c4a]/5" style={{ borderColor: '#d1d5db' }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#6b7c4a' }}>
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: '#1e2328' }}>Lihat Proyek</p>
              <p className="text-xs" style={{ color: '#9ca3af' }}>Daftar semua proyek</p>
            </div>
          </div>
        </Link>
        {Permissions.canViewCatalog(session.role) && (
          <Link href="/dashboard/pos/catalog">
            <div className="flex items-center gap-3 p-4 rounded-lg border border-dashed transition-all cursor-pointer hover:border-[#6b7c4a] hover:bg-[#6b7c4a]/5" style={{ borderColor: '#d1d5db' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#6b7c4a' }}>
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: '#1e2328' }}>Katalog Jasa</p>
                <p className="text-xs" style={{ color: '#9ca3af' }}>Kelola layanan & harga</p>
              </div>
            </div>
          </Link>
        )}
      </div>
    </div>
  )
}
