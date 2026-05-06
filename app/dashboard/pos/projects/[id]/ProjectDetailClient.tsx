'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Plus, Trash2, Phone, MapPin, CheckCircle, Clock, AlertCircle, Printer, X } from 'lucide-react'
import Link from 'next/link'

type ServiceCatalog = { id: string; nama: string; satuan: string; hargaDefault: string }
type ContractItem = { id: string; deskripsi: string | null; volume: string; hargaSatuan: string; subtotal: string; service: ServiceCatalog }
type PaymentTerm = { id: string; namaTermin: string; persentase: string; jumlah: string; status: string; tanggalTagih: string | null; tanggalBayar: string | null; catatan: string | null }
type Expense = { id: string; kategori: string; deskripsi: string; jumlah: string; tanggal: string }
type Contract = { id: string; nilaiKontrak: string; tanggalMulai: string | null; tanggalSelesai: string | null; catatan: string | null; items: ContractItem[]; termins: PaymentTerm[]; expenses: Expense[] }
type Project = { id: string; projectId: string; namaProyek: string; alamatProyek: string; status: string; catatan: string | null; customer: { nama: string; noWa: string; alamat: string | null }; contract: Contract | null; attachments: any[] }

const TERMIN_STATUS_CONFIG = {
  BELUM_DITAGIH: { label: 'Belum Ditagih', icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-100' },
  MENUNGGU_PEMBAYARAN: { label: 'Menunggu Bayar', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  LUNAS: { label: 'Lunas', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
}

const SATUAN_LABEL: Record<string, string> = { PER_M2: 'm²', PER_PAKET: 'paket', PER_TITIK: 'titik' }

function formatRupiah(n: number | string) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(n))
}

export function ProjectDetailClient({ project: initial, catalogs }: { project: Project; catalogs: ServiceCatalog[] }) {
  const router = useRouter()
  const [project, setProject] = useState(initial)
  const [tab, setTab] = useState<'overview' | 'contract' | 'termins' | 'expenses'>('overview')
  const [showContractForm, setShowContractForm] = useState(false)
  const [contractItems, setContractItems] = useState([{ serviceId: '', deskripsi: '', volume: '', hargaSatuan: '', satuanCustom: 'm2' }])
  const [termins, setTermins] = useState([
    { namaTermin: 'DP', persentase: '30', nominalInput: '' },
    { namaTermin: 'Termin-1', persentase: '40', nominalInput: '' },
    { namaTermin: 'Pelunasan', persentase: '30', nominalInput: '' },
  ])
  const [contractDates, setContractDates] = useState({ tanggalMulai: '', tanggalSelesai: '', catatan: '' })
  const [contractLoading, setContractLoading] = useState(false)
  const [contractError, setContractError] = useState('')
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [expenseForm, setExpenseForm] = useState({ kategori: 'MATERIAL', deskripsi: '', jumlah: '', tanggal: '', jenisMaterial: '', qty: '', hargaSatuan: '', satuanMaterial: 'sak' })
  const [expenseLoading, setExpenseLoading] = useState(false)

  const nilaiKontrak = contractItems.reduce((s, i) => s + (Number(i.volume) * Number(i.hargaSatuan) || 0), 0)
  const totalPersen = termins.reduce((s, t) => s + Number(t.persentase || 0), 0)

  function addItem() { setContractItems(p => [...p, { serviceId: '', deskripsi: '', volume: '', hargaSatuan: '', satuanCustom: 'm2' }]) }
  function removeItem(i: number) { setContractItems(p => p.filter((_, idx) => idx !== i)) }
  function updateItem(i: number, field: string, val: string) {
    setContractItems(p => p.map((item, idx) => {
      if (idx !== i) return item
      const updated = { ...item, [field]: val }
      if (field === 'serviceId') {
        const svc = catalogs.find(c => c.id === val)
        if (svc) {
          updated.hargaSatuan = String(svc.hargaDefault)
          updated.volume = svc.satuan === 'PER_PAKET' ? '1' : ''
          updated.deskripsi = ''
        }
      }
      return updated
    }))
  }

  async function handleCreateContract(e: React.FormEvent) {
    e.preventDefault()
    setContractLoading(true)
    setContractError('')

    // Validasi client-side
    for (const item of contractItems) {
      if (!item.serviceId) { setContractError('Pilih jasa untuk semua item'); setContractLoading(false); return }
      if (!Number(item.hargaSatuan) || Number(item.hargaSatuan) <= 0) { setContractError('Harga satuan harus lebih dari 0'); setContractLoading(false); return }
      if (!Number(item.volume) || Number(item.volume) <= 0) { setContractError('Volume/jumlah harus lebih dari 0'); setContractLoading(false); return }
    }
    const res = await fetch('/api/pos/contracts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: project.id, nilaiKontrak, ...contractDates,
        items: contractItems.map(i => ({ serviceId: i.serviceId, deskripsi: i.deskripsi || undefined, volume: Number(i.volume) || 1, hargaSatuan: Number(i.hargaSatuan) })),
        termins: termins.map(t => ({ namaTermin: t.namaTermin, persentase: Number(t.persentase) })),
      }),
    })
    if (res.ok) { router.refresh(); window.location.reload() }
    else {
      const err = await res.json()
      const msg = typeof err.error === 'string' ? err.error : JSON.stringify(err.error?.fieldErrors ?? err.error)
      setContractError(msg || 'Gagal membuat kontrak')
    }
    setContractLoading(false)
  }

  async function updateTerminStatus(terminId: string, status: string) {
    const data: any = { status }
    if (status === 'MENUNGGU_PEMBAYARAN') data.tanggalTagih = new Date().toISOString()
    if (status === 'LUNAS') data.tanggalBayar = new Date().toISOString()
    const res = await fetch(`/api/pos/termins/${terminId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    })
    if (res.ok) {
      const updated = await res.json()
      setProject(p => ({ ...p, contract: p.contract ? { ...p.contract, termins: p.contract.termins.map(t => t.id === terminId ? { ...t, ...updated } : t) } : null }))
    }
  }

  async function handleAddExpense(e: React.FormEvent) {
    e.preventDefault()
    if (!project.contract) return
    setExpenseLoading(true)

    // Hitung jumlah: kalau material pakai qty × harga, kalau lain pakai jumlah langsung
    let jumlahFinal = Number(expenseForm.jumlah)
    let deskripsiFinal = expenseForm.deskripsi
    if (expenseForm.kategori === 'MATERIAL' && expenseForm.jenisMaterial) {
      jumlahFinal = Number(expenseForm.qty) * Number(expenseForm.hargaSatuan)
      deskripsiFinal = `${expenseForm.jenisMaterial} ${expenseForm.qty} ${expenseForm.satuanMaterial} × ${formatRupiah(expenseForm.hargaSatuan)}`
    }

    const res = await fetch('/api/pos/expenses', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...expenseForm, deskripsi: deskripsiFinal, contractId: project.contract.id, jumlah: jumlahFinal }),
    })
    if (res.ok) {
      const data = await res.json()
      setProject(p => ({ ...p, contract: p.contract ? { ...p.contract, expenses: [data, ...p.contract.expenses] } : null }))
      setExpenseForm({ kategori: 'MATERIAL', deskripsi: '', jumlah: '', tanggal: '', jenisMaterial: '', qty: '', hargaSatuan: '', satuanMaterial: 'sak' })
      setShowExpenseModal(false)
    }
    setExpenseLoading(false)
  }

  async function handleDeleteExpense(id: string) {
    if (!confirm('Hapus biaya ini?')) return
    const res = await fetch(`/api/pos/expenses/${id}`, { method: 'DELETE' })
    if (res.ok) setProject(p => ({ ...p, contract: p.contract ? { ...p.contract, expenses: p.contract.expenses.filter(e => e.id !== id) } : null }))
    else alert('Gagal menghapus')
  }

  const totalExpenses = project.contract?.expenses.reduce((s, e) => s + Number(e.jumlah), 0) ?? 0
  const totalLunas = project.contract?.termins.filter(t => t.status === 'LUNAS').reduce((s, t) => s + Number(t.jumlah), 0) ?? 0
  const profit = totalLunas - totalExpenses

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href="/dashboard/pos/projects">
          <Button variant="outline" size="sm" className="shrink-0 mt-0.5"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-muted-foreground">{project.projectId}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">{project.status}</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold truncate">{project.namaProyek}</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-4 text-xs text-muted-foreground mt-1">
            <span className="flex items-center gap-1 truncate"><Phone className="h-3 w-3 shrink-0" />{project.customer.nama} · {project.customer.noWa}</span>
            <span className="flex items-center gap-1 truncate"><MapPin className="h-3 w-3 shrink-0" />{project.alamatProyek}</span>
          </div>
        </div>
      </div>

      {/* Tabs — scrollable on mobile */}
      <div className="flex border-b overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {([
          { key: 'overview', label: 'Ringkasan' },
          { key: 'contract', label: 'Kontrak' },
          { key: 'termins', label: 'Termin' },
          { key: 'expenses', label: 'Biaya Operasional' },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-3 sm:px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors shrink-0 ${tab === t.key ? 'border-[#6b7c4a] text-[#6b7c4a]' : 'border-transparent text-muted-foreground'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Ringkasan */}
      {tab === 'overview' && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Nilai Kontrak', value: formatRupiah(project.contract?.nilaiKontrak ?? 0), color: 'text-blue-700' },
            { label: 'Total Lunas', value: formatRupiah(totalLunas), color: 'text-green-700' },
            { label: 'Total Biaya', value: formatRupiah(totalExpenses), color: 'text-red-600' },
            { label: 'Est. Profit', value: formatRupiah(profit), color: profit >= 0 ? 'text-emerald-700' : 'text-red-700' },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`text-sm sm:text-base font-bold ${s.color} truncate`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tab: Kontrak */}
      {tab === 'contract' && (
        <div className="space-y-4">
          {project.contract ? (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm sm:text-base">Detail Kontrak</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-xs text-muted-foreground">Nilai Kontrak</p><p className="font-bold">{formatRupiah(project.contract.nilaiKontrak)}</p></div>
                  {project.contract.tanggalMulai && <div><p className="text-xs text-muted-foreground">Mulai</p><p>{new Date(project.contract.tanggalMulai).toLocaleDateString('id-ID')}</p></div>}
                  {project.contract.tanggalSelesai && <div><p className="text-xs text-muted-foreground">Selesai</p><p>{new Date(project.contract.tanggalSelesai).toLocaleDateString('id-ID')}</p></div>}
                </div>
                {/* Scrollable table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm" style={{ minWidth: 420 }}>
                    <thead><tr className="border-b text-muted-foreground">
                      <th className="text-left py-1">Jasa</th>
                      <th className="text-right py-1">Vol</th>
                      <th className="text-right py-1">Harga</th>
                      <th className="text-right py-1">Subtotal</th>
                    </tr></thead>
                    <tbody>
                      {project.contract.items.map(item => (
                        <tr key={item.id} className="border-b">
                          <td className="py-2 pr-2">{item.service.nama}{item.deskripsi && <span className="text-muted-foreground"> · {item.deskripsi}</span>}</td>
                          <td className="text-right whitespace-nowrap">{item.volume} {SATUAN_LABEL[item.service.satuan] ?? ''}</td>
                          <td className="text-right whitespace-nowrap pl-2">{formatRupiah(item.hargaSatuan)}</td>
                          <td className="text-right font-medium whitespace-nowrap pl-2">{formatRupiah(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot><tr>
                      <td colSpan={3} className="text-right font-bold pt-2">Total</td>
                      <td className="text-right font-bold pt-2 pl-2">{formatRupiah(project.contract.nilaiKontrak)}</td>
                    </tr></tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <Button onClick={() => setShowContractForm(!showContractForm)} style={{ background: '#6b7c4a' }} className="text-white">
                <Plus className="h-4 w-4 mr-2" /> Buat Kontrak
              </Button>
              {showContractForm && (
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm sm:text-base">Buat Kontrak Baru</CardTitle></CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateContract} className="space-y-5">
                      {/* Items — stacked on mobile */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Item Jasa</label>
                          <Button type="button" size="sm" variant="outline" onClick={addItem}><Plus className="h-3 w-3 mr-1" />Tambah</Button>
                        </div>
                        {contractItems.map((item, i) => {
                          const svc = catalogs.find(c => c.id === item.serviceId)
                          const satuan = svc?.satuan ?? ''
                          const subtotal = Number(item.volume) * Number(item.hargaSatuan) || 0

                          return (
                          <div key={i} className="p-3 border rounded-lg space-y-3">
                            {/* Dropdown pilih jasa */}
                            <div className="flex items-center gap-2">
                              <select className="flex-1 border rounded-md px-2 py-2 text-sm" value={item.serviceId} onChange={e => updateItem(i, 'serviceId', e.target.value)} required>
                                <option value="">-- Pilih Jasa --</option>
                                {catalogs.map(c => <option key={c.id} value={c.id}>{c.nama}</option>)}
                              </select>
                              {contractItems.length > 1 && <Button type="button" size="sm" variant="ghost" onClick={() => removeItem(i)}><Trash2 className="h-3 w-3 text-red-500" /></Button>}
                            </div>

                            {/* Form dinamis berdasarkan satuan */}
                            {satuan === 'PER_M2' && (
                              <div className="space-y-2">
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="col-span-2 space-y-1">
                                    <label className="text-xs text-muted-foreground">Volume</label>
                                    <Input placeholder="Contoh: 120" type="number" value={item.volume} onChange={e => updateItem(i, 'volume', e.target.value)} required />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Satuan</label>
                                    <select className="w-full border rounded-md px-2 py-2 text-sm" value={item.satuanCustom} onChange={e => updateItem(i, 'satuanCustom', e.target.value)}>
                                      <option value="m2">m²</option>
                                      <option value="m1">m¹</option>
                                      <option value="unit">unit</option>
                                    </select>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-xs text-muted-foreground">Harga per {item.satuanCustom} (Rp)</label>
                                  <Input placeholder="Harga satuan" type="number" value={item.hargaSatuan} onChange={e => updateItem(i, 'hargaSatuan', e.target.value)} required />
                                </div>
                              </div>
                            )}

                            {satuan === 'PER_TITIK' && (
                              <div className="space-y-2">
                                <div className="space-y-1">
                                  <label className="text-xs text-muted-foreground">Jumlah Titik</label>
                                  <Input placeholder="Contoh: 5" type="number" value={item.volume} onChange={e => updateItem(i, 'volume', e.target.value)} required />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-xs text-muted-foreground">Harga per Titik (Rp)</label>
                                  <Input placeholder="Harga per titik" type="number" value={item.hargaSatuan} onChange={e => updateItem(i, 'hargaSatuan', e.target.value)} required />
                                </div>
                              </div>
                            )}

                            {satuan === 'PER_PAKET' && (
                              <div className="space-y-2">
                                <div className="space-y-1">
                                  <label className="text-xs text-muted-foreground">Paket / Keterangan</label>
                                  <select className="w-full border rounded-md px-2 py-2 text-sm" value={item.deskripsi} onChange={e => updateItem(i, 'deskripsi', e.target.value)}>
                                    <option value="">-- Pilih Paket --</option>
                                    <option value="Lite">Lite</option>
                                    <option value="Standard">Standard</option>
                                    <option value="Premium">Premium</option>
                                    <option value="Custom">Custom</option>
                                  </select>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Luas Bangunan (m²) — opsional</label>
                                    <Input placeholder="Contoh: 72" type="number" value={item.volume === '1' ? '' : item.volume} onChange={e => updateItem(i, 'volume', e.target.value || '1')} />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Harga Paket (Rp)</label>
                                    <Input placeholder="Harga paket" type="number" value={item.hargaSatuan} onChange={e => updateItem(i, 'hargaSatuan', e.target.value)} required />
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Fallback: jasa belum dipilih atau satuan tidak dikenal */}
                            {!satuan && (
                              <p className="text-xs text-muted-foreground italic">Pilih jasa terlebih dahulu</p>
                            )}

                            {/* Subtotal */}
                            {satuan && (
                              <div className="flex items-center justify-between pt-1 border-t">
                                <span className="text-xs text-muted-foreground">
                                  {satuan === 'PER_M2' && `${item.volume || 0} ${item.satuanCustom} × ${formatRupiah(item.hargaSatuan || 0)}`}
                                  {satuan === 'PER_TITIK' && `${item.volume || 0} titik × ${formatRupiah(item.hargaSatuan || 0)}`}
                                  {satuan === 'PER_PAKET' && (item.deskripsi || 'Paket')}
                                </span>
                                <span className="text-sm font-semibold" style={{ color: '#6b7c4a' }}>{formatRupiah(subtotal)}</span>
                              </div>
                            )}
                          </div>
                          )
                        })}
                        <p className="text-right font-bold text-sm">Total: {formatRupiah(nilaiKontrak)}</p>
                      </div>

                      {/* Termin */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Termin Pembayaran</label>
                          <span className={`text-xs font-medium ${Math.abs(totalPersen - 100) > 0.01 ? 'text-red-600' : 'text-green-600'}`}>
                            {totalPersen}% {Math.abs(totalPersen - 100) > 0.01 ? '≠ 100%' : '✓'}
                          </span>
                        </div>
                        {termins.map((t, i) => {
                          const nominalDariPersen = nilaiKontrak > 0 ? Math.round((nilaiKontrak * Number(t.persentase)) / 100) : 0
                          // Tampilkan nominalInput kalau user lagi ngetik, kalau tidak tampilkan hasil kalkulasi
                          const nominalDisplay = t.nominalInput !== '' ? t.nominalInput : (nominalDariPersen > 0 ? String(nominalDariPersen) : '')
                          return (
                          <div key={i} className="space-y-1.5">
                            <div className="flex gap-2 items-center">
                              <Input className="flex-1" placeholder="Nama Termin" value={t.namaTermin} onChange={e => setTermins(p => p.map((x, idx) => idx === i ? { ...x, namaTermin: e.target.value } : x))} required />
                              {termins.length > 1 && <Button type="button" size="sm" variant="ghost" onClick={() => setTermins(p => p.filter((_, idx) => idx !== i))}><Trash2 className="h-3 w-3 text-red-500" /></Button>}
                            </div>
                            <div className="flex gap-2 items-center">
                              {/* Input nominal → hitung persentase */}
                              <div className="flex-1 relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Rp</span>
                                <Input
                                  className="pl-8 text-sm"
                                  placeholder="Nominal"
                                  type="number"
                                  value={nominalDisplay}
                                  onChange={e => {
                                    const val = e.target.value
                                    const pct = nilaiKontrak > 0 && val ? ((Number(val) / nilaiKontrak) * 100).toFixed(2) : ''
                                    setTermins(p => p.map((x, idx) => idx === i ? { ...x, nominalInput: val, persentase: pct } : x))
                                  }}
                                  onBlur={() => {
                                    // Saat blur, simpan persentase final — nominalInput tetap ada supaya angka tidak berubah
                                    // Tidak perlu clear, biarkan user lihat angka yang dia ketik
                                  }}
                                />
                              </div>
                              {/* Input persentase → hitung nominal */}
                              <div className="w-20 relative">
                                <Input
                                  className="pr-6 text-sm"
                                  placeholder="%"
                                  type="number"
                                  value={t.persentase}
                                  onChange={e => setTermins(p => p.map((x, idx) => idx === i ? { ...x, persentase: e.target.value, nominalInput: '' } : x))}
                                  required
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                              </div>
                            </div>
                          </div>
                          )
                        })}
                        <Button type="button" size="sm" variant="outline" onClick={() => setTermins(p => [...p, { namaTermin: '', persentase: '', nominalInput: '' }])}>
                          <Plus className="h-3 w-3 mr-1" /> Tambah Termin
                        </Button>
                      </div>

                      {/* Tanggal */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1"><label className="text-sm font-medium">Tanggal Mulai</label><Input type="date" value={contractDates.tanggalMulai} onChange={e => setContractDates(p => ({ ...p, tanggalMulai: e.target.value }))} /></div>
                        <div className="space-y-1"><label className="text-sm font-medium">Tanggal Selesai</label><Input type="date" value={contractDates.tanggalSelesai} onChange={e => setContractDates(p => ({ ...p, tanggalSelesai: e.target.value }))} /></div>
                      </div>

                      {contractError && <p className="text-sm text-red-600">{contractError}</p>}
                      <button type="submit" disabled={contractLoading || Math.abs(totalPersen - 100) > 0.01}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
                        style={{ background: '#6b7c4a' }}>
                        {contractLoading ? 'Menyimpan...' : 'Simpan Kontrak'}
                      </button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab: Termin */}
      {tab === 'termins' && (
        <div className="space-y-3">
          {!project.contract && <p className="text-muted-foreground text-sm">Buat kontrak terlebih dahulu.</p>}
          {project.contract?.termins.map(t => {
            const cfg = TERMIN_STATUS_CONFIG[t.status as keyof typeof TERMIN_STATUS_CONFIG]
            const Icon = cfg.icon
            return (
              <Card key={t.id}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Icon className={`h-4 w-4 shrink-0 ${cfg.color}`} />
                        <span className="font-semibold">{t.namaTermin}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                      </div>
                      <p className="font-bold">{formatRupiah(t.jumlah)} <span className="text-xs font-normal text-muted-foreground">({t.persentase}%)</span></p>
                      {t.tanggalTagih && <p className="text-xs text-muted-foreground">Ditagih: {new Date(t.tanggalTagih).toLocaleDateString('id-ID')}</p>}
                      {t.tanggalBayar && <p className="text-xs text-green-600">Dibayar: {new Date(t.tanggalBayar).toLocaleDateString('id-ID')}</p>}
                    </div>
                    <div className="flex flex-col gap-1.5 items-end shrink-0">
                      {t.status === 'BELUM_DITAGIH' && (
                        <Button size="sm" variant="outline" onClick={() => updateTerminStatus(t.id, 'MENUNGGU_PEMBAYARAN')}>Tagih</Button>
                      )}
                      {t.status === 'MENUNGGU_PEMBAYARAN' && (<>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => updateTerminStatus(t.id, 'LUNAS')}>Lunas</Button>
                        <Link href={`/dashboard/pos/invoice/${t.id}`} target="_blank">
                          <Button size="sm" variant="outline"><Printer className="h-3 w-3 mr-1" />Invoice</Button>
                        </Link>
                      </>)}
                      {t.status === 'LUNAS' && (
                        <Link href={`/dashboard/pos/invoice/${t.id}`} target="_blank">
                          <Button size="sm" variant="outline" className="text-green-700 border-green-300"><Printer className="h-3 w-3 mr-1" />Kwitansi</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Tab: Biaya Operasional */}
      {tab === 'expenses' && (
        <div className="space-y-4">
          {!project.contract && <p className="text-muted-foreground text-sm">Buat kontrak terlebih dahulu.</p>}
          {project.contract && (<>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">Biaya: <span className="text-red-600">{formatRupiah(totalExpenses)}</span></p>
                <p className="text-xs text-muted-foreground">Profit: <span className={profit >= 0 ? 'text-emerald-600' : 'text-red-600'}>{formatRupiah(profit)}</span></p>
              </div>
              <button onClick={() => setShowExpenseModal(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-white" style={{ background: '#6b7c4a' }}>
                <Plus className="h-4 w-4" /> Tambah
              </button>
            </div>
            <div className="space-y-2">
              {project.contract.expenses.map(exp => (
                <div key={exp.id} className="flex items-start justify-between gap-2 p-3 border rounded-lg">
                  <div className="min-w-0">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 mr-1">{exp.kategori}</span>
                    <span className="text-sm">{exp.deskripsi}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(exp.tanggal).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-semibold text-red-600 text-sm">{formatRupiah(exp.jumlah)}</span>
                    <button onClick={() => handleDeleteExpense(exp.id)} className="text-red-400 hover:text-red-600 transition-colors" title="Hapus biaya">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              {project.contract.expenses.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">Belum ada biaya operasional.</p>}
            </div>
          </>)}
        </div>
      )}

      {/* Modal: Tambah Biaya — slides up from bottom on mobile */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold">Tambah Biaya Operasional</h2>
              <button onClick={() => setShowExpenseModal(false)} className="p-1 text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAddExpense} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Kategori</label>
                  <select className="w-full border rounded-md px-3 py-2 text-sm" value={expenseForm.kategori} onChange={e => setExpenseForm(p => ({ ...p, kategori: e.target.value, jenisMaterial: '', qty: '', hargaSatuan: '', deskripsi: '' }))}>
                    <option value="MATERIAL">Material</option>
                    <option value="TUKANG">Tukang / Upah</option>
                    <option value="OPERASIONAL">Sewa Alat</option>
                    <option value="LAINNYA">Lainnya</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Tanggal</label>
                  <Input type="date" value={expenseForm.tanggal} onChange={e => setExpenseForm(p => ({ ...p, tanggal: e.target.value }))} />
                </div>
              </div>

              {/* Form dinamis untuk Material */}
              {expenseForm.kategori === 'MATERIAL' ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Jenis Material *</label>
                    <select className="w-full border rounded-md px-3 py-2 text-sm" value={expenseForm.jenisMaterial} onChange={e => setExpenseForm(p => ({ ...p, jenisMaterial: e.target.value }))} required>
                      <option value="">-- Pilih Material --</option>
                      <optgroup label="Struktur">
                        <option value="Semen">Semen</option>
                        <option value="Besi Beton">Besi Beton</option>
                        <option value="Besi Hollow">Besi Hollow</option>
                        <option value="Baja Ringan">Baja Ringan</option>
                      </optgroup>
                      <optgroup label="Pasangan">
                        <option value="Batu Bata">Batu Bata</option>
                        <option value="Batako">Batako</option>
                        <option value="Hebel/AAC">Hebel/AAC</option>
                        <option value="Pasir">Pasir</option>
                        <option value="Batu Split">Batu Split</option>
                        <option value="Kerikil">Kerikil</option>
                      </optgroup>
                      <optgroup label="Finishing">
                        <option value="Cat Tembok">Cat Tembok</option>
                        <option value="Cat Kayu">Cat Kayu</option>
                        <option value="Keramik">Keramik</option>
                        <option value="Granit">Granit</option>
                        <option value="Plester/Acian">Plester/Acian</option>
                      </optgroup>
                      <optgroup label="Kayu & Atap">
                        <option value="Kayu Balok">Kayu Balok</option>
                        <option value="Kayu Papan">Kayu Papan</option>
                        <option value="Triplek">Triplek</option>
                        <option value="Genteng">Genteng</option>
                        <option value="Spandek">Spandek</option>
                        <option value="Asbes">Asbes</option>
                      </optgroup>
                      <optgroup label="Sanitasi & Listrik">
                        <option value="Pipa PVC">Pipa PVC</option>
                        <option value="Kabel Listrik">Kabel Listrik</option>
                        <option value="Saklar/Stop Kontak">Saklar/Stop Kontak</option>
                      </optgroup>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Qty *</label>
                      <Input type="number" placeholder="5" value={expenseForm.qty} onChange={e => setExpenseForm(p => ({ ...p, qty: e.target.value }))} required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Satuan</label>
                      <select className="w-full border rounded-md px-3 py-2 text-sm" value={expenseForm.satuanMaterial} onChange={e => setExpenseForm(p => ({ ...p, satuanMaterial: e.target.value }))}>
                        <option value="sak">sak</option>
                        <option value="kg">kg</option>
                        <option value="ton">ton</option>
                        <option value="m²">m²</option>
                        <option value="m³">m³</option>
                        <option value="m¹">m¹</option>
                        <option value="batang">batang</option>
                        <option value="lembar">lembar</option>
                        <option value="buah">buah</option>
                        <option value="unit">unit</option>
                        <option value="liter">liter</option>
                        <option value="galon">galon</option>
                        <option value="roll">roll</option>
                        <option value="dus">dus</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Harga/satuan *</label>
                      <Input type="number" placeholder="50000" value={expenseForm.hargaSatuan} onChange={e => setExpenseForm(p => ({ ...p, hargaSatuan: e.target.value }))} required />
                    </div>
                  </div>
                  {/* Preview total */}
                  {expenseForm.qty && expenseForm.hargaSatuan && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-orange-50 border border-orange-100">
                      <span className="text-xs text-muted-foreground">{expenseForm.qty} {expenseForm.satuanMaterial} × {formatRupiah(expenseForm.hargaSatuan)}</span>
                      <span className="font-semibold text-sm" style={{ color: '#d97706' }}>{formatRupiah(Number(expenseForm.qty) * Number(expenseForm.hargaSatuan))}</span>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Deskripsi *</label>
                    <Input value={expenseForm.deskripsi} onChange={e => setExpenseForm(p => ({ ...p, deskripsi: e.target.value }))} placeholder={expenseForm.kategori === 'TUKANG' ? 'Upah tukang bata 3 hari...' : 'Sewa molen 2 hari...'} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Jumlah (Rp) *</label>
                    <Input type="number" inputMode="numeric" value={expenseForm.jumlah} onChange={e => setExpenseForm(p => ({ ...p, jumlah: e.target.value }))} placeholder="1500000" required />
                  </div>
                </>
              )}
              <div className="flex gap-2 pb-1">
                <button type="submit" disabled={expenseLoading} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60" style={{ background: '#6b7c4a' }}>
                  {expenseLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button type="button" onClick={() => setShowExpenseModal(false)} className="px-4 py-2.5 rounded-lg text-sm border">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
