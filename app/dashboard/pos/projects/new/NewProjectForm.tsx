'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Customer = { id: string; nama: string; noWa: string }

export function NewProjectForm({ customers }: { customers: Customer[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    customerId: '', namaProyek: '', alamatProyek: '', catatan: '',
  })
  const [newCustomer, setNewCustomer] = useState(false)
  const [custForm, setCustForm] = useState({ nama: '', noWa: '', alamat: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    let customerId = form.customerId

    // Buat pelanggan baru jika dipilih
    if (newCustomer) {
      const res = await fetch('/api/pos/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(custForm),
      })
      if (!res.ok) { setError('Gagal membuat pelanggan'); setLoading(false); return }
      const cust = await res.json()
      customerId = cust.id
    }

    const res = await fetch('/api/pos/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, customerId }),
    })

    if (res.ok) {
      const project = await res.json()
      router.push(`/dashboard/pos/projects/${project.id}`)
    } else {
      setError('Gagal membuat proyek')
    }
    setLoading(false)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pelanggan */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Pelanggan *</label>
              <button
                type="button"
                onClick={() => setNewCustomer(!newCustomer)}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                style={{
                  background: newCustomer ? 'rgba(107,124,74,0.12)' : 'rgba(107,124,74,0.08)',
                  color: '#6b7c4a',
                  border: '1px solid rgba(107,124,74,0.3)',
                }}
              >
                {newCustomer ? (
                  <><span>←</span> Pilih yang ada</>
                ) : (
                  <><span className="text-base leading-none">+</span> Pelanggan baru</>
                )}
              </button>
            </div>
            {newCustomer ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-lg" style={{ background: 'rgba(107,124,74,0.06)', border: '1px solid rgba(107,124,74,0.2)' }}>
                <div className="space-y-1">
                  <label className="text-xs font-medium" style={{ color: '#6b7c4a' }}>Nama *</label>
                  <Input placeholder="Budi Santoso" value={custForm.nama} onChange={e => setCustForm(p => ({ ...p, nama: e.target.value }))} required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium" style={{ color: '#6b7c4a' }}>No. WhatsApp *</label>
                  <Input placeholder="08123456789" value={custForm.noWa} onChange={e => setCustForm(p => ({ ...p, noWa: e.target.value }))} required />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-medium" style={{ color: '#6b7c4a' }}>Alamat</label>
                  <Input placeholder="Jl. Merdeka No. 1, Jakarta" value={custForm.alamat} onChange={e => setCustForm(p => ({ ...p, alamat: e.target.value }))} />
                </div>
              </div>
            ) : (
              <select
                className="w-full rounded-lg px-3 py-2 text-sm transition-colors"
                style={{ border: '1px solid #e5e7eb', background: 'white' }}
                value={form.customerId}
                onChange={e => setForm(p => ({ ...p, customerId: e.target.value }))}
                required
              >
                <option value="">-- Pilih Pelanggan --</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.nama} ({c.noWa})</option>)}
              </select>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Nama Proyek *</label>
            <Input value={form.namaProyek} onChange={e => setForm(p => ({ ...p, namaProyek: e.target.value }))} placeholder="Bangun Rumah Type 45 - Pak Budi" required />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Alamat Proyek *</label>
            <Input value={form.alamatProyek} onChange={e => setForm(p => ({ ...p, alamatProyek: e.target.value }))} placeholder="Jl. Merdeka No. 1, Jakarta Selatan" required />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Catatan</label>
            <textarea
              className="w-full border rounded-md px-3 py-2 text-sm min-h-[80px]"
              value={form.catatan}
              onChange={e => setForm(p => ({ ...p, catatan: e.target.value }))}
              placeholder="Catatan tambahan..."
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-60"
              style={{ background: '#6b7c4a' }}
            >
              {loading ? 'Membuat...' : 'Buat Proyek'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ border: '1px solid #e5e7eb', color: '#6b7281' }}
            >
              Batal
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
