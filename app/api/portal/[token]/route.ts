import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const project = await prisma.project.findUnique({
    where: { publicToken: token },
    include: {
      customer: { select: { nama: true, noWa: true } },
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

  if (!project) return NextResponse.json({ error: 'Proyek tidak ditemukan' }, { status: 404 })

  // Serialize Decimal fields
  return NextResponse.json({
    projectId: project.projectId,
    namaProyek: project.namaProyek,
    alamatProyek: project.alamatProyek,
    status: project.status,
    progress: project.progress,
    catatan: project.catatan,
    customer: project.customer,
    contract: project.contract ? {
      nilaiKontrak: String(project.contract.nilaiKontrak),
      tanggalMulai: project.contract.tanggalMulai,
      tanggalSelesai: project.contract.tanggalSelesai,
      items: project.contract.items.map(i => ({
        nama: i.service.nama,
        satuan: i.service.satuan,
        volume: String(i.volume),
        hargaSatuan: String(i.hargaSatuan),
        subtotal: String(i.subtotal),
        deskripsi: i.deskripsi,
      })),
      termins: project.contract.termins.map(t => ({
        id: t.id,
        namaTermin: t.namaTermin,
        persentase: String(t.persentase),
        jumlah: String(t.jumlah),
        status: t.status,
        tanggalJatuhTempo: t.tanggalJatuhTempo,
        tanggalTagih: t.tanggalTagih,
        tanggalBayar: t.tanggalBayar,
      })),
    } : null,
    attachments: project.attachments.map(a => ({
      id: a.id,
      namaFile: a.namaFile,
      url: a.url,
      tipe: a.tipe,
      kategori: a.kategori,
    })),
  })
}
