import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { CheckCircle, Clock, AlertCircle, MapPin, FileText, TrendingUp } from 'lucide-react'

function formatRupiah(n: number | string) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(n))
}

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT:   { label: 'Persiapan',  color: 'text-gray-600',  bg: 'bg-gray-100' },
  AKTIF:   { label: 'Berjalan',   color: 'text-blue-700',  bg: 'bg-blue-100' },
  SELESAI: { label: 'Selesai',    color: 'text-green-700', bg: 'bg-green-100' },
  BATAL:   { label: 'Dibatalkan', color: 'text-red-700',   bg: 'bg-red-100' },
}

const TERMIN_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  BELUM_DITAGIH:       { label: 'Belum Ditagih',     icon: AlertCircle, color: 'text-gray-500',   bg: 'bg-gray-100' },
  MENUNGGU_PEMBAYARAN: { label: 'Menunggu Pembayaran', icon: Clock,       color: 'text-amber-600', bg: 'bg-amber-100' },
  LUNAS:               { label: 'Lunas',              icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
}

const KAT_LABEL: Record<string, string> = {
  RAB: 'RAB', DESAIN: 'Desain', SONDIR: 'Tes Sondir', KONTRAK: 'Kontrak', LAINNYA: 'Dokumen'
}

export default async function PortalKlienPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const project = await prisma.project.findUnique({
    where: { publicToken: token },
    include: {
      customer: { select: { nama: true } },
      contract: {
        include: {
          items: { include: { service: { select: { nama: true, satuan: true } } } },
          termins: { orderBy: { createdAt: 'asc' } },
        },
      },
      attachments: {
        where: { kategori: { in: ['DESAIN', 'RAB', 'KONTRAK', 'SONDIR'] } },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!project) notFound()

  const status = STATUS_LABEL[project.status] ?? STATUS_LABEL.DRAFT
  const totalTagihan = Number(project.contract?.nilaiKontrak ?? 0)
  const totalLunas = project.contract?.termins
    .filter(t => t.status === 'LUNAS')
    .reduce((s, t) => s + Number(t.jumlah), 0) ?? 0
  const sisaTagihan = totalTagihan - totalLunas

  return (
    <div className="min-h-screen" style={{ background: '#f5f5f0' }}>
      {/* Header */}
      <div className="px-4 py-6" style={{ background: '#1e2328' }}>
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#6b7c4a' }}>
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs" style={{ color: '#a8b89a' }}>Fidyatama Contractor</p>
              <p className="text-sm font-semibold text-white">Portal Klien</p>
            </div>
          </div>
          <h1 className="text-xl font-bold text-white">{project.namaProyek}</h1>
          <div className="flex items-center gap-2 mt-1">
            <MapPin className="h-3 w-3" style={{ color: '#a8b89a' }} />
            <p className="text-sm" style={{ color: '#a8b89a' }}>{project.alamatProyek}</p>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${status.bg} ${status.color}`}>
              {status.label}
            </span>
            <span className="text-xs" style={{ color: '#6b7c4a' }}>
              {project.projectId}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* Progress */}
        {project.status === 'AKTIF' && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm font-semibold mb-3">Progress Pekerjaan</p>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Selesai</span>
              <span className="font-bold" style={{ color: '#6b7c4a' }}>{project.progress}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${project.progress}%`, background: '#6b7c4a' }} />
            </div>
            {project.contract?.tanggalSelesai && (
              <p className="text-xs text-muted-foreground mt-2">
                Target selesai: {new Date(project.contract.tanggalSelesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
        )}

        {/* Ringkasan Keuangan */}
        {project.contract && (
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
            <p className="text-sm font-semibold">Ringkasan Pembayaran</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-2 rounded-lg bg-gray-50">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-xs font-bold mt-0.5">{formatRupiah(totalTagihan)}</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-green-50">
                <p className="text-xs text-green-600">Lunas</p>
                <p className="text-xs font-bold text-green-700 mt-0.5">{formatRupiah(totalLunas)}</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-amber-50">
                <p className="text-xs text-amber-600">Sisa</p>
                <p className="text-xs font-bold text-amber-700 mt-0.5">{formatRupiah(sisaTagihan)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Termin Pembayaran */}
        {project.contract && project.contract.termins.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
            <p className="text-sm font-semibold">Termin Pembayaran</p>
            {project.contract.termins.map(t => {
              const cfg = TERMIN_CONFIG[t.status] ?? TERMIN_CONFIG.BELUM_DITAGIH
              const Icon = cfg.icon
              return (
                <div key={t.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 shrink-0 ${cfg.color}`} />
                    <div>
                      <p className="text-sm font-medium">{t.namaTermin}</p>
                      {t.tanggalJatuhTempo && t.status === 'BELUM_DITAGIH' && (
                        <p className="text-xs text-muted-foreground">
                          Jatuh tempo: {new Date(t.tanggalJatuhTempo).toLocaleDateString('id-ID')}
                        </p>
                      )}
                      {t.tanggalBayar && (
                        <p className="text-xs text-green-600">
                          Dibayar: {new Date(t.tanggalBayar).toLocaleDateString('id-ID')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold">{formatRupiah(String(t.jumlah))}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Dokumen */}
        {project.attachments.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
            <p className="text-sm font-semibold">Dokumen Proyek</p>
            {project.attachments.map(a => (
              <a key={a.id} href={a.url} target="_blank" rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: a.tipe === 'image' ? '#6b7c4a' : a.tipe === 'pdf' ? '#ef4444' : '#3b82f6' }}>
                  {a.tipe === 'image' ? 'IMG' : a.tipe === 'pdf' ? 'PDF' : 'DOC'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{a.namaFile}</p>
                  <p className="text-xs text-muted-foreground">{KAT_LABEL[a.kategori] ?? a.kategori}</p>
                </div>
                <span className="text-xs shrink-0" style={{ color: '#6b7c4a' }}>Buka →</span>
              </a>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground pb-4">
          Fidyatama Design, Build & Demolis Contractor
        </p>
      </div>
    </div>
  )
}
