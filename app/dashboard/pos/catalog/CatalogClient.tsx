'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Package } from 'lucide-react'

type Catalog = {
  id: string; nama: string; deskripsi: string | null
  satuan: 'PER_M2' | 'PER_PAKET' | 'PER_TITIK'; hargaDefault: string | number; aktif: boolean
}

const SATUAN_LABEL = { PER_M2: 'per m²', PER_PAKET: 'per Paket', PER_TITIK: 'per Titik' }
const SATUAN_COLOR = { PER_M2: 'bg-blue-100 text-blue-700', PER_PAKET: 'bg-purple-100 text-purple-700', PER_TITIK: 'bg-green-100 text-green-700' }

function formatRupiah(n: number | string) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(n))
}

export function CatalogClient({ initialData }: { initialData: Catalog[] }) {
  const [catalogs, setCatalogs] = useState(initialData)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ nama: '', deskripsi: '', satuan: 'PER_M2', hargaDefault: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/pos/catalog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, hargaDefault: Number(form.hargaDefault) }),
    })
    if (res.ok) {
      const data = await res.json()
      setCatalogs(prev => [data, ...prev])
      setForm({ nama: '', deskripsi: '', satuan: 'PER_M2', hargaDefault: '' })
      setShowForm(false)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Katalog Jasa</h1>
          <p className="text-sm text-muted-foreground">Kelola jenis layanan dan harga satuan</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" /> Tambah Jasa
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">Tambah Jasa Baru</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Nama Jasa</label>
                <Input value={form.nama} onChange={e => setForm(p => ({ ...p, nama: e.target.value }))} placeholder="Bangun Rumah Type 36" required />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Satuan</label>
                <select className="w-full border rounded-md px-3 py-2 text-sm" value={form.satuan} onChange={e => setForm(p => ({ ...p, satuan: e.target.value }))}>
                  <option value="PER_M2">per m² (Bangun/Renovasi)</option>
                  <option value="PER_PAKET">per Paket (Desain)</option>
                  <option value="PER_TITIK">per Titik (Tes Tanah)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Harga Default (Rp)</label>
                <Input type="number" value={form.hargaDefault} onChange={e => setForm(p => ({ ...p, hargaDefault: e.target.value }))} placeholder="2500000" required />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Deskripsi</label>
                <Input value={form.deskripsi} onChange={e => setForm(p => ({ ...p, deskripsi: e.target.value }))} placeholder="Opsional" />
              </div>
              <div className="md:col-span-2 flex gap-2">
                <Button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {catalogs.map(c => (
          <Card key={c.id}>
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">{c.nama}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SATUAN_COLOR[c.satuan]}`}>
                  {SATUAN_LABEL[c.satuan]}
                </span>
              </div>
              {c.deskripsi && <p className="text-xs text-muted-foreground">{c.deskripsi}</p>}
              <p className="text-lg font-bold text-green-700">{formatRupiah(c.hargaDefault)}</p>
            </CardContent>
          </Card>
        ))}
        {catalogs.length === 0 && (
          <div className="col-span-3 text-center py-12 text-muted-foreground">
            Belum ada katalog jasa. Tambahkan yang pertama.
          </div>
        )}
      </div>
    </div>
  )
}
