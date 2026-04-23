'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, User, Phone, MapPin, Trash2 } from 'lucide-react'

type Customer = {
  id: string; nama: string; noWa: string
  alamat: string | null; email: string | null
  _count: { projects: number }
}

export function CustomersClient({ initialData }: { initialData: Customer[] }) {
  const [customers, setCustomers] = useState(initialData)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ nama: '', noWa: '', alamat: '', email: '' })

  async function handleDelete(id: string, nama: string) {
    if (!confirm(`Hapus pelanggan "${nama}"?`)) return
    const res = await fetch(`/api/pos/customers/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (res.ok) setCustomers(prev => prev.filter(c => c.id !== id))
    else alert(data.error ?? 'Gagal menghapus')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/pos/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const data = await res.json()
      setCustomers(prev => [{ ...data, _count: { projects: 0 } }, ...prev])
      setForm({ nama: '', noWa: '', alamat: '', email: '' })
      setShowForm(false)
    }
    setLoading(false)
  }

  const filtered = customers.filter(c =>
    c.nama.toLowerCase().includes(search.toLowerCase()) ||
    c.noWa.includes(search)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pelanggan</h1>
          <p className="text-sm text-muted-foreground">{customers.length} pelanggan terdaftar</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" /> Tambah Pelanggan
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">Pelanggan Baru</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Nama Lengkap *</label>
                <Input value={form.nama} onChange={e => setForm(p => ({ ...p, nama: e.target.value }))} placeholder="Budi Santoso" required />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">No. WhatsApp *</label>
                <Input value={form.noWa} onChange={e => setForm(p => ({ ...p, noWa: e.target.value }))} placeholder="08123456789" required />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Alamat Proyek</label>
                <Input value={form.alamat} onChange={e => setForm(p => ({ ...p, alamat: e.target.value }))} placeholder="Jl. Merdeka No. 1, Jakarta" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="budi@email.com" />
              </div>
              <div className="md:col-span-2 flex gap-2">
                <Button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Input placeholder="Cari nama atau nomor WA..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => (
          <Card key={c.id}>
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">{c.nama}</span>
                </div>
                {c._count.projects === 0 && (
                  <button onClick={() => handleDelete(c.id, c.nama)} className="text-red-400 hover:text-red-600 transition-colors" title="Hapus pelanggan">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-3 w-3" />
                <a href={`https://wa.me/62${c.noWa.replace(/^0/, '')}`} target="_blank" rel="noreferrer" className="hover:text-green-600">
                  {c.noWa}
                </a>
              </div>
              {c.alamat && (
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                  <span>{c.alamat}</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground">{c._count.projects} proyek</p>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-12 text-muted-foreground">Tidak ada pelanggan ditemukan.</div>
        )}
      </div>
    </div>
  )
}
