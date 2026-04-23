'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

type Row = {
  id: string
  namaTermin: string
  jumlah: string
  tanggalBayar: string | null
  contract: {
    project: {
      id: string
      namaProyek: string
      customer: { nama: string }
    }
  }
}

function formatRupiah(n: number | string) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(n))
}

export function LunasTable({ data }: { data: Row[] }) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return data.filter(t =>
      t.contract.project.customer.nama.toLowerCase().includes(q) ||
      t.contract.project.namaProyek.toLowerCase().includes(q) ||
      t.namaTermin.toLowerCase().includes(q)
    )
  }, [data, search])

  const total = filtered.reduce((s, t) => s + Number(t.jumlah), 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Cari konsumen atau proyek..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <span className="text-sm text-muted-foreground shrink-0">{filtered.length} data</span>
      </div>

      {search && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200">
          <p className="text-xs text-green-700">Total dari hasil pencarian: <span className="font-bold">{formatRupiah(total)}</span></p>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-muted-foreground text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3">Tgl Bayar</th>
              <th className="text-left px-4 py-3">Konsumen</th>
              <th className="text-left px-4 py-3">Proyek</th>
              <th className="text-left px-4 py-3">Termin</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-muted-foreground">
                  {t.tanggalBayar ? new Date(t.tanggalBayar).toLocaleDateString('id-ID') : '-'}
                </td>
                <td className="px-4 py-3 font-medium">{t.contract.project.customer.nama}</td>
                <td className="px-4 py-3">
                  <Link href={`/dashboard/pos/projects/${t.contract.project.id}`} className="hover:underline" style={{ color: '#6b7c4a' }}>
                    {t.contract.project.namaProyek}
                  </Link>
                </td>
                <td className="px-4 py-3">{t.namaTermin}</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
                    Lunas
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold" style={{ color: '#22c55e' }}>
                  {formatRupiah(t.jumlah)}
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
