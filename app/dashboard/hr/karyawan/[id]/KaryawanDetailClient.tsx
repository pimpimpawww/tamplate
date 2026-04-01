'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus, Phone, MapPin, Briefcase, Calendar, X, CheckCircle, Clock } from 'lucide-react'

type Project = { id: string; projectId: string; namaProyek: string }
type Penugasan = { id: string; peran: string | null; tanggalMulai: string | null; tanggalSelesai: string | null; project: { id: string; projectId: string; namaProyek: string; status: string } }
type Upah = { id: string; periode: string; jumlahHari: number; upahPerHari: number; totalUpah: number; status: string; tanggalBayar: string | null; project: { projectId: string; namaProyek: string } | null }
type Karyawan = {
  id: string; nama: string; nik: string | null; jabatan: string; noHp: string | null
  alamat: string | null; gajiPokok: number | null; tanggalMasuk: string | null
  status: string; catatan: string | null
  penugasan: Penugasan[]; upah: Upah[]
}

const JABATAN_LABEL: Record<string, string> = {
  MANDOR: 'Mandor', TUKANG: 'Tukang', KENEK: 'Kenek',
  DESAINER: 'Desainer', SURVEYOR: 'Surveyor', ADMIN_KANTOR: 'Admin Kantor', LAINNYA: 'Lainnya',
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

export function KaryawanDetailClient({ karyawan: initial, projects }: { karyawan: Karyawan; projects: Project[] }) {
  const [karyawan, setKaryawan] = useState(initial)
  const [tab, setTab] = useState<'info' | 'penugasan' | 'upah'>('info')
  const [showPenugasanModal, setShowPenugasanModal] = useState(false)
  const [showUpahModal, setShowUpahModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const [penugasanForm, setPenugasanForm] = useState({ projectId: '', peran: '', tanggalMulai: '', tanggalSelesai: '' })
  const [upahForm, setUpahForm] = useState({ projectId: '', periode: '', jumlahHari: '1', upahPerHari: String(karyawan.gajiPokok ? Math.round(karyawan.gajiPokok / 26) : '') })

  const totalUpahBelumBayar = karyawan.upah.filter(u => u.status === 'BELUM_DIBAYAR').reduce((s, u) => s + Number(u.totalUpah), 0)
  const totalUpahDibayar = karyawan.upah.filter(u => u.status === 'SUDAH_DIBAYAR').reduce((s, u) => s + Number(u.totalUpah), 0)

  async function handleTambahPenugasan(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/hr/penugasan', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...penugasanForm, karyawanId: karyawan.id }),
    })
    if (res.ok) {
      const data = await res.json()
      setKaryawan(p => ({ ...p, penugasan: [data, ...p.penugasan] }))
      setPenugasanForm({ projectId: '', peran: '', tanggalMulai: '', tanggalSelesai: '' })
      setShowPenugasanModal(false)
    }
    setLoading(false)
  }

  async function handleTambahUpah(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/hr/upah', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        karyawanId: karyawan.id,
        projectId: upahForm.projectId || undefined,
        periode: upahForm.periode,
        jumlahHari: Number(upahForm.jumlahHari),
        upahPerHari: Number(upahForm.upahPerHari),
      }),
    })
    if (res.ok) {
      const data = await res.json()
      setKaryawan(p => ({ ...p, upah: [data, ...p.upah] }))
      setUpahForm(f => ({ ...f, periode: '', jumlahHari: '1' }))
      setShowUpahModal(false)
    }
    setLoading(false)
  }

  async function bayarUpah(upahId: string) {
    const res = await fetch(`/api/hr/upah/${upahId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'SUDAH_DIBAYAR' }),
    })
    if (res.ok) {
      const updated = await res.json()
      setKaryawan(p => ({ ...p, upah: p.upah.map(u => u.id === upahId ? { ...u, ...updated } : u) }))
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href="/dashboard/hr/karyawan">
          <Button variant="outline" size="sm" className="shrink-0 mt-0.5"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${karyawan.status === 'AKTIF' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{karyawan.status}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">{JABATAN_LABEL[karyawan.jabatan]}</span>
          </div>
          <h1 className="text-xl font-bold">{karyawan.nama}</h1>
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 text-xs text-muted-foreground mt-1">
            {karyawan.noHp && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{karyawan.noHp}</span>}
            {karyawan.alamat && <span className="flex items-center gap-1 truncate"><MapPin className="h-3 w-3 shrink-0" />{karyawan.alamat}</span>}
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card><CardContent className="p-3">
          <p className="text-xs text-muted-foreground">Proyek Ditugaskan</p>
          <p className="text-xl font-bold" style={{ color: '#6b7c4a' }}>{karyawan.penugasan.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <p className="text-xs text-muted-foreground">Upah Belum Dibayar</p>
          <p className="text-base font-bold text-yellow-600">{formatRupiah(totalUpahBelumBayar)}</p>
        </CardContent></Card>
        <Card className="col-span-2 sm:col-span-1"><CardContent className="p-3">
          <p className="text-xs text-muted-foreground">Total Dibayar</p>
          <p className="text-base font-bold text-green-600">{formatRupiah(totalUpahDibayar)}</p>
        </CardContent></Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {([['info','Info'], ['penugasan','Penugasan'], ['upah','Catatan Upah']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors shrink-0 ${tab === key ? 'border-[#6b7c4a] text-[#6b7c4a]' : 'border-transparent text-muted-foreground'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Tab: Info */}
      {tab === 'info' && (
        <Card><CardContent className="p-4 grid grid-cols-2 gap-4 text-sm">
          {[
            ['NIK', karyawan.nik ?? '-'],
            ['Jabatan', JABATAN_LABEL[karyawan.jabatan]],
            ['Gaji Pokok', karyawan.gajiPokok ? formatRupiah(karyawan.gajiPokok) : '-'],
            ['Tgl Masuk', karyawan.tanggalMasuk ? new Date(karyawan.tanggalMasuk).toLocaleDateString('id-ID') : '-'],
            ['No. HP', karyawan.noHp ?? '-'],
            ['Status', karyawan.status],
          ].map(([label, val]) => (
            <div key={label}>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="font-medium">{val}</p>
            </div>
          ))}
          {karyawan.alamat && <div className="col-span-2"><p className="text-xs text-muted-foreground">Alamat</p><p className="font-medium">{karyawan.alamat}</p></div>}
          {karyawan.catatan && <div className="col-span-2"><p className="text-xs text-muted-foreground">Catatan</p><p className="font-medium">{karyawan.catatan}</p></div>}
        </CardContent></Card>
      )}

      {/* Tab: Penugasan */}
      {tab === 'penugasan' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={() => setShowPenugasanModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white" style={{ background: '#6b7c4a' }}>
              <Plus className="h-4 w-4" /> Tugaskan ke Proyek
            </button>
          </div>
          {karyawan.penugasan.map(p => (
            <Card key={p.id}><CardContent className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm">{p.project.namaProyek}</p>
                  <p className="text-xs text-muted-foreground font-mono">{p.project.projectId}</p>
                  {p.peran && <p className="text-xs mt-1" style={{ color: '#6b7c4a' }}>{p.peran}</p>}
                  {p.tanggalMulai && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(p.tanggalMulai).toLocaleDateString('id-ID')}
                      {p.tanggalSelesai && ` — ${new Date(p.tanggalSelesai).toLocaleDateString('id-ID')}`}
                    </p>
                  )}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${p.project.status === 'AKTIF' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                  {p.project.status}
                </span>
              </div>
            </CardContent></Card>
          ))}
          {karyawan.penugasan.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">Belum ada penugasan proyek.</p>}
        </div>
      )}

      {/* Tab: Upah */}
      {tab === 'upah' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={() => setShowUpahModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white" style={{ background: '#6b7c4a' }}>
              <Plus className="h-4 w-4" /> Catat Upah
            </button>
          </div>
          {karyawan.upah.map(u => (
            <Card key={u.id}><CardContent className="p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{u.periode}</p>
                  {u.project && <p className="text-xs text-muted-foreground">{u.project.namaProyek}</p>}
                  <p className="text-xs text-muted-foreground mt-0.5">{u.jumlahHari} hari × {formatRupiah(u.upahPerHari)}</p>
                  {u.tanggalBayar && <p className="text-xs text-green-600">Dibayar: {new Date(u.tanggalBayar).toLocaleDateString('id-ID')}</p>}
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <p className="font-bold text-sm">{formatRupiah(u.totalUpah)}</p>
                  {u.status === 'BELUM_DIBAYAR' ? (
                    <button onClick={() => bayarUpah(u.id)}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg border border-yellow-300 text-yellow-700 hover:bg-yellow-50">
                      <Clock className="h-3 w-3" /> Bayar
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle className="h-3 w-3" /> Lunas
                    </span>
                  )}
                </div>
              </div>
            </CardContent></Card>
          ))}
          {karyawan.upah.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">Belum ada catatan upah.</p>}
        </div>
      )}

      {/* Modal Penugasan */}
      {showPenugasanModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold">Tugaskan ke Proyek</h2>
              <button onClick={() => setShowPenugasanModal(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <form onSubmit={handleTambahPenugasan} className="p-4 space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Proyek *</label>
                <select className="w-full border rounded-md px-3 py-2 text-sm" value={penugasanForm.projectId} onChange={e => setPenugasanForm(p => ({ ...p, projectId: e.target.value }))} required>
                  <option value="">-- Pilih Proyek --</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.namaProyek} ({p.projectId})</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Peran / Posisi</label>
                <Input value={penugasanForm.peran} onChange={e => setPenugasanForm(p => ({ ...p, peran: e.target.value }))} placeholder="Mandor Utama, Tukang Besi, dll" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><label className="text-sm font-medium">Tgl Mulai</label><Input type="date" value={penugasanForm.tanggalMulai} onChange={e => setPenugasanForm(p => ({ ...p, tanggalMulai: e.target.value }))} /></div>
                <div className="space-y-1"><label className="text-sm font-medium">Tgl Selesai</label><Input type="date" value={penugasanForm.tanggalSelesai} onChange={e => setPenugasanForm(p => ({ ...p, tanggalSelesai: e.target.value }))} /></div>
              </div>
              <div className="flex gap-2 pb-1">
                <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60" style={{ background: '#6b7c4a' }}>
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button type="button" onClick={() => setShowPenugasanModal(false)} className="px-4 py-2.5 rounded-lg text-sm border">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Upah */}
      {showUpahModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold">Catat Upah — {karyawan.nama}</h2>
              <button onClick={() => setShowUpahModal(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <form onSubmit={handleTambahUpah} className="p-4 space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Periode *</label>
                <Input value={upahForm.periode} onChange={e => setUpahForm(p => ({ ...p, periode: e.target.value }))} placeholder="Minggu 1 - Juni 2026" required />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Proyek (opsional)</label>
                <select className="w-full border rounded-md px-3 py-2 text-sm" value={upahForm.projectId} onChange={e => setUpahForm(p => ({ ...p, projectId: e.target.value }))}>
                  <option value="">-- Tidak terkait proyek --</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.namaProyek}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Jumlah Hari *</label>
                  <Input type="number" min="1" value={upahForm.jumlahHari} onChange={e => setUpahForm(p => ({ ...p, jumlahHari: e.target.value }))} required />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Upah/Hari (Rp) *</label>
                  <Input type="number" value={upahForm.upahPerHari} onChange={e => setUpahForm(p => ({ ...p, upahPerHari: e.target.value }))} placeholder="150000" required />
                </div>
              </div>
              <div className="p-3 rounded-lg text-sm font-semibold" style={{ background: 'rgba(107,124,74,0.1)', color: '#6b7c4a' }}>
                Total: {formatRupiah(Number(upahForm.jumlahHari || 0) * Number(upahForm.upahPerHari || 0))}
              </div>
              <div className="flex gap-2 pb-1">
                <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60" style={{ background: '#6b7c4a' }}>
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button type="button" onClick={() => setShowUpahModal(false)} className="px-4 py-2.5 rounded-lg text-sm border">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
