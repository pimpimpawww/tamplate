'use client'
import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Printer, ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'

type ServiceItem = { id: string; deskripsi: string | null; volume: string; hargaSatuan: string; subtotal: string; service: { nama: string; satuan: string } }
type Termin = {
  id: string; namaTermin: string; persentase: string; jumlah: string
  status: string; tanggalTagih: string | null; tanggalBayar: string | null; catatan: string | null
  contract: {
    id: string; nilaiKontrak: string; tanggalMulai: string | null
    items: ServiceItem[]
    project: { projectId: string; namaProyek: string; alamatProyek: string; customer: { nama: string; noWa: string; alamat: string | null } }
  }
}

const SATUAN_LABEL: Record<string, string> = { PER_M2: 'm²', PER_PAKET: 'paket', PER_TITIK: 'titik' }

function formatRupiah(n: number | string) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(n))
}

function terbilang(n: number): string {
  const satuan = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan',
    'sepuluh', 'sebelas', 'dua belas', 'tiga belas', 'empat belas', 'lima belas', 'enam belas',
    'tujuh belas', 'delapan belas', 'sembilan belas']
  if (n < 20) return satuan[n]
  if (n < 100) return satuan[Math.floor(n / 10)] + ' puluh' + (n % 10 ? ' ' + satuan[n % 10] : '')
  if (n < 200) return 'seratus' + (n % 100 ? ' ' + terbilang(n % 100) : '')
  if (n < 1000) return satuan[Math.floor(n / 100)] + ' ratus' + (n % 100 ? ' ' + terbilang(n % 100) : '')
  if (n < 2000) return 'seribu' + (n % 1000 ? ' ' + terbilang(n % 1000) : '')
  if (n < 1000000) return terbilang(Math.floor(n / 1000)) + ' ribu' + (n % 1000 ? ' ' + terbilang(n % 1000) : '')
  if (n < 1000000000) return terbilang(Math.floor(n / 1000000)) + ' juta' + (n % 1000000 ? ' ' + terbilang(n % 1000000) : '')
  return terbilang(Math.floor(n / 1000000000)) + ' miliar' + (n % 1000000000 ? ' ' + terbilang(n % 1000000000) : '')
}

export function InvoicePrint({ termin }: { termin: Termin }) {
  const printRef = useRef<HTMLDivElement>(null)
  const isKwitansi = termin.status === 'LUNAS'
  const { project } = termin.contract
  const docNumber = `${isKwitansi ? 'KWT' : 'INV'}/${project.projectId}/${termin.namaTermin.replace(/\s+/g, '-').toUpperCase()}`
  const tanggalDoc = isKwitansi && termin.tanggalBayar
    ? new Date(termin.tanggalBayar)
    : termin.tanggalTagih ? new Date(termin.tanggalTagih) : new Date()

  function handlePrint() {
    window.print()
  }

  return (
    <div>
      {/* Toolbar — hidden on print */}
      <div className="print:hidden flex items-center gap-3 p-4 border-b sticky top-0 z-10" style={{ background: '#1e2328', borderColor: '#2d3339' }}>
        <Link href="javascript:history.back()">
          <Button variant="outline" size="sm" style={{ borderColor: '#3d4449', color: '#a8b89a', background: 'transparent' }}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Kembali
          </Button>
        </Link>
        <div className="flex-1">
          <span className="font-semibold text-white">{isKwitansi ? 'Kwitansi' : 'Invoice'}</span>
          <span className="text-sm ml-2" style={{ color: '#6b7c4a' }}>{docNumber}</span>
        </div>
        {isKwitansi && (
          <span className="flex items-center gap-1 text-sm font-medium" style={{ color: '#a8b89a' }}>
            <CheckCircle className="h-4 w-4" style={{ color: '#6b7c4a' }} /> LUNAS
          </span>
        )}
        <Button onClick={handlePrint} style={{ background: '#6b7c4a', color: 'white' }} className="hover:opacity-90">
          <Printer className="h-4 w-4 mr-2" /> Cetak / Simpan PDF
        </Button>
      </div>

      {/* Document */}
      <div ref={printRef} className="max-w-2xl mx-auto p-8 bg-white print:p-6 print:max-w-none print:mx-0">
        {/* Letterhead */}
        <div className="flex items-start justify-between border-b-2 pb-4 mb-6" style={{ borderColor: '#1e2328' }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              {/* Logo mark */}
              <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="6" fill="#6b7c4a" />
                <rect x="8" y="18" width="6" height="14" fill="white" opacity="0.9" />
                <rect x="17" y="12" width="6" height="20" fill="white" />
                <rect x="26" y="22" width="6" height="10" fill="white" opacity="0.7" />
                <path d="M6 18 L11 10 L16 18" fill="white" opacity="0.9" />
                <path d="M15 12 L20 4 L25 12" fill="white" />
                <path d="M24 22 L29 16 L34 22" fill="white" opacity="0.7" />
              </svg>
              <div>
                <h1 className="text-xl font-black uppercase tracking-widest" style={{ color: '#1e2328', lineHeight: 1 }}>FIDYATAMA</h1>
                <p className="text-xs uppercase tracking-widest" style={{ color: '#6b7c4a' }}>Design &amp; Build Contractor</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">Jl. Contoh No. 1, Kota Anda · Telp: 0812-XXXX-XXXX</p>
          </div>
          <div className="text-right">
            <div className={`text-lg font-black px-4 py-1.5 rounded uppercase tracking-widest ${isKwitansi ? 'text-white' : 'text-white'}`}
              style={{ background: isKwitansi ? '#6b7c4a' : '#1e2328' }}>
              {isKwitansi ? 'KWITANSI' : 'INVOICE'}
            </div>
            <p className="text-xs text-gray-500 mt-1 font-mono">{docNumber}</p>
            <p className="text-xs text-gray-500">{tanggalDoc.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Billing Info */}
        <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Kepada Yth.</p>
            <p className="font-bold text-gray-800">{project.customer.nama}</p>
            <p className="text-gray-600">{project.customer.noWa}</p>
            {project.customer.alamat && <p className="text-gray-600">{project.customer.alamat}</p>}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Detail Proyek</p>
            <p className="font-semibold text-gray-800">{project.namaProyek}</p>
            <p className="text-gray-600 font-mono text-xs">{project.projectId}</p>
            <p className="text-gray-600 text-xs">{project.alamatProyek}</p>
          </div>
        </div>

        {/* Termin Info */}
        <div className="bg-gray-50 rounded-lg p-3 mb-6 text-sm">
          <p className="font-semibold text-gray-700">
            {isKwitansi ? 'Telah diterima pembayaran' : 'Tagihan pembayaran'} —
            <span className="text-blue-700 ml-1">{termin.namaTermin} ({termin.persentase}% dari nilai kontrak)</span>
          </p>
        </div>

        {/* Items Table */}
        <table className="w-full text-sm mb-6">
          <thead>
            <tr style={{ background: '#1e2328', color: 'white' }}>
              <th className="text-left px-3 py-2 rounded-tl text-xs uppercase tracking-wider">No</th>
              <th className="text-left px-3 py-2 text-xs uppercase tracking-wider">Uraian Pekerjaan</th>
              <th className="text-right px-3 py-2 text-xs uppercase tracking-wider">Vol</th>
              <th className="text-right px-3 py-2 text-xs uppercase tracking-wider">Harga Satuan</th>
              <th className="text-right px-3 py-2 rounded-tr text-xs uppercase tracking-wider">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {termin.contract.items.map((item, i) => (
              <tr key={item.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-3 py-2 text-gray-500">{i + 1}</td>
                <td className="px-3 py-2">
                  <span className="font-medium">{item.service.nama}</span>
                  {item.deskripsi && <span className="text-gray-500"> — {item.deskripsi}</span>}
                </td>
                <td className="px-3 py-2 text-right">{item.volume} {SATUAN_LABEL[item.service.satuan] ?? ''}</td>
                <td className="px-3 py-2 text-right">{formatRupiah(item.hargaSatuan)}</td>
                <td className="px-3 py-2 text-right font-medium">{formatRupiah(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-6">
          <div className="w-72 space-y-1 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Nilai Kontrak</span>
              <span>{formatRupiah(termin.contract.nilaiKontrak)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Termin {termin.namaTermin} ({termin.persentase}%)</span>
              <span>{formatRupiah(termin.jumlah)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
              <span>{isKwitansi ? 'Jumlah Diterima' : 'Jumlah Tagihan'}</span>
              <span className={isKwitansi ? 'text-green-700' : 'text-blue-700'}>{formatRupiah(termin.jumlah)}</span>
            </div>
          </div>
        </div>

        {/* Terbilang */}
        <div className="border border-dashed rounded p-3 mb-8 text-sm">
          <span className="text-gray-500">Terbilang: </span>
          <span className="font-medium italic capitalize">{terbilang(Math.round(Number(termin.jumlah)))} rupiah</span>
        </div>

        {/* Signature */}
        <div className="grid grid-cols-2 gap-8 text-sm text-center">
          <div>
            <p className="text-gray-500 mb-16">Hormat kami,</p>
            <div className="border-t border-gray-400 pt-1">
              <p className="font-semibold">PT. Jasa Properti</p>
              <p className="text-xs text-gray-500">Direktur</p>
            </div>
          </div>
          {isKwitansi && (
            <div>
              <p className="text-gray-500 mb-16">Penerima,</p>
              <div className="border-t border-gray-400 pt-1">
                <p className="font-semibold">{project.customer.nama}</p>
                <p className="text-xs text-gray-500">Pelanggan</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t text-xs text-gray-400 text-center">
          Dokumen ini digenerate otomatis oleh sistem POS · {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #__next, #__next * { visibility: hidden; }
          .print\\:hidden { display: none !important; }
          [ref="printRef"], [ref="printRef"] * { visibility: visible; }
          @page { margin: 1cm; size: A4; }
        }
      `}</style>
    </div>
  )
}
