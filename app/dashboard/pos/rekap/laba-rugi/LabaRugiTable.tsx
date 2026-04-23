'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

type Row = {
  project: { id: string; namaProyek: string; status: string; customer: { nama: string } }
  pendapatan: number
  biaya: number
  laba: number
}

function formatRupiah(n: number | string) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(n))
}

const STATUS_COLOR: Record<string, string> = {
  AKTIF: 'bg-blue-100 text-blue-700',
  SELESAI: 'bg-green-100 text-green-700',
  DRAFT: 'bg-gray-100 text-gray-700',
  BATAL: 'bg-red-100 text-red-700',
}

export function LabaRugiTable({ data }: { data: Row[] }) {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return data.filter(d =>
      (d.project.namaProyek.toLowerCase().includes(q) || d.project.customer.nama.toLowerCase().includes(q)) &&
      (filterStatus ? d.project.status === filterStatus : true)
    )
  }, [data, search, filterStatus])

  const totalPendapatan = filtered.reduce((s, d) => s + d.pendapatan, 0)
  const totalBiaya = filtered.reduce((s, d) => s + d.biaya, 0)
  const totalLaba = totalPendapatan - totalBiaya

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Cari proyek atau konsumen..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select
          className="border rounded-md px-3 py-2 text-sm"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="">Semua Status</option>
          <option value="AKTIF">Aktif</option>
          <option value="SELESAI">Selesai</option>
        </select>
        <span className="text-sm text-muted-foreground shrink-0">{filtered.length} proyek</span>
      </div>

      {(search || filterStatus) && (
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-green-50 border border-green-200">
            <p className="text-xs text-green-700">Pendapatan</p>
            <p className="font-bold text-green-700">{formatRupiah(totalPendapatan)}</p>
          </div>
          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-xs text-red-700">Biaya</p>
            <p className="font-bold text-red-700">{formatRupiah(totalBiaya)}</p>
          </div>
          <div className={`p-3 rounded-lg border ${totalLaba >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <p className="text-xs" style={{ color: totalLaba >= 0 ? '#6b7c4a' : '#ef4444' }}>Laba</p>
            <p className="font-bold" style={{ color: totalLaba >= 0 ? '#6b7c4a' : '#ef4444' }}>{formatRupiah(totalLaba)}</p>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-muted-foreground text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3">Proyek</th>
              <th className="text-left px-4 py-3">Konsumen</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Pendapatan</th>
              <th className="text-right px-4 py-3">Biaya</th>
              <th className="text-right px-4 py-3">Laba</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(d => (
              <tr key={d.project.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/dashboard/pos/projects/${d.project.id}`} className="hover:underline font-medium" style={{ color: '#6b7c4a' }}>
                    {d.project.namaProyek}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{d.project.customer.nama}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[d.project.status] ?? 'bg-gray-100 text-gray-700'}`}>
                    {d.project.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right" style={{ color: '#22c55e' }}>{formatRupiah(d.pendapatan)}</td>
                <td className="px-4 py-3 text-right" style={{ color: '#ef4444' }}>{formatRupiah(d.biaya)}</td>
                <td className="px-4 py-3 text-right font-semibold" style={{ color: d.laba >= 0 ? '#6b7c4a' : '#ef4444' }}>
                  {formatRupiah(d.laba)}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">Tidak ada data ditemukan</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
