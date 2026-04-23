'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, User, Phone, Briefcase, X, Search, Trash2 } from 'lucide-react'

type Karyawan = {
  id: string; nama: string; nik: string | null; jabatan: string
  noHp: string | null; gajiPokok: number | null; status: string
  _count: { penugasan: number; upah: number }
}

const JABATAN_LABEL: Record<string, string> = {
  MANDOR: 'Mandor', TUKANG: 'Tukang', KENEK: 'Kenek',
  DESAINER: 'Desainer', SURVEYOR: 'Surveyor', ADMIN_KANTOR: 'Admin Kantor', LAINNYA: 'Lainnya',
}
const JABATAN_COLOR: Record<string, string> = {
  MANDOR: 'bg-purple-100 text-purple-700', TUKANG: 'bg-blue-100 text-blue-700',
  KENEK: 'bg-gray-100 text-gray-700', DESAINER: 'bg-pink-100 text-pink-700',
  SURVEYOR: 'bg-yellow-100 text-yellow-700', ADMIN_KANTOR: 'bg-green-100 text-green-700',
  LAINNYA: 'bg-orange-100 text-orange-700',
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

export function KaryawanClient({ initialData }: { initialData: Karyawan[] }) {
  const [list, setList] = useState(initialData)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nama: '', nik: '', jabatan: 'TUKANG', noHp: '', alamat: '', gajiPokok: '', tanggalMasuk: '', catatan: '',
  })

  const filtered = list.filter(k =>
    k.nama.toLowerCase().includes(search.toLowerCase()) ||
    (k.noHp ?? '').includes(search) ||
    JABATAN_LABEL[k.jabatan]?.toLowerCase().includes(search.toLowerCase())
  )

  async function handleDelete(id: string, nama: string, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(`Hapus karyawan "${nama}"?`)) return
    const res = await fetch(`/api/hr/karyawan/${id}`, { method: 'DELETE' })
    if (res.ok) setList(prev => prev.filter(k => k.id !== id))
    else alert('Gagal menghapus karyawan')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/hr/karyawan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, gajiPokok: form.gajiPokok ? Number(form.gajiPokok) : undefined }),
    })
    if (res.ok) {
      const data = await res.json()
      setList(p => [...p, { ...data, _count: { penugasan: 0, upah: 0 } }].sort((a, b) => a.nama.localeCompare(b.nama)))
      setForm({ nama: '', nik: '', jabatan: 'TUKANG', noHp: '', alamat: '', gajiPokok: '', tanggalMasuk: '', catatan: '' })
      setShowModal(false)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wide" style={{ color: '#1e2328' }}>Karyawan</h1>
          <p className="text-sm" style={{ color: '#6b7c4a' }}>{list.filter(k => k.status === 'AKTIF').length} karyawan aktif</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: '#6b7c4a' }}>
          <Plus className="h-4 w-4" /> Tambah Karyawan
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Cari nama, jabatan, no HP..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(k => (
          <Link key={k.id} href={`/dashboard/hr/karyawan/${k.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{ background: '#6b7c4a' }}>
                      {k.nama.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{k.nama}</p>
                      {k.nik && <p className="text-xs text-muted-foreground">NIK: {k.nik}</p>}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-medium ${k.status === 'AKTIF' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {k.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${JABATAN_COLOR[k.jabatan]}`}>
                    {JABATAN_LABEL[k.jabatan]}
                  </span>
                  {k.noHp && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />{k.noHp}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
                  <span><Briefcase className="h-3 w-3 inline mr-1" />{k._count.penugasan} proyek</span>
                  <div className="flex items-center gap-2">
                    {k.gajiPokok && <span className="font-medium" style={{ color: '#6b7c4a' }}>{formatRupiah(k.gajiPokok)}/bln</span>}
                    <button onClick={(e) => handleDelete(k.id, k.nama, e)} className="text-red-400 hover:text-red-600 transition-colors" title="Hapus karyawan">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-16 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>Belum ada karyawan. Tambahkan yang pertama.</p>
          </div>
        )}
      </div>

      {/* Modal Tambah */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h2 className="font-semibold">Tambah Karyawan Baru</h2>
              <button onClick={() => setShowModal(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="text-sm font-medium">Nama Lengkap *</label>
                  <Input value={form.nama} onChange={e => setForm(p => ({ ...p, nama: e.target.value }))} placeholder="Budi Santoso" required />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Jabatan *</label>
                  <select className="w-full border rounded-md px-3 py-2 text-sm" value={form.jabatan} onChange={e => setForm(p => ({ ...p, jabatan: e.target.value }))}>
                    {Object.entries(JABATAN_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">No. HP</label>
                  <Input value={form.noHp} onChange={e => setForm(p => ({ ...p, noHp: e.target.value }))} placeholder="08123456789" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">NIK</label>
                  <Input value={form.nik} onChange={e => setForm(p => ({ ...p, nik: e.target.value }))} placeholder="3271xxxxxxxxxxxx" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Gaji Pokok (Rp)</label>
                  <Input type="number" value={form.gajiPokok} onChange={e => setForm(p => ({ ...p, gajiPokok: e.target.value }))} placeholder="3000000" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Tanggal Masuk</label>
                  <Input type="date" value={form.tanggalMasuk} onChange={e => setForm(p => ({ ...p, tanggalMasuk: e.target.value }))} />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-sm font-medium">Alamat</label>
                  <Input value={form.alamat} onChange={e => setForm(p => ({ ...p, alamat: e.target.value }))} placeholder="Jl. Contoh No. 1" />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-sm font-medium">Catatan</label>
                  <Input value={form.catatan} onChange={e => setForm(p => ({ ...p, catatan: e.target.value }))} placeholder="Keahlian khusus, dll" />
                </div>
              </div>
              <div className="flex gap-2 pb-1">
                <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60" style={{ background: '#6b7c4a' }}>
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-lg text-sm border">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
