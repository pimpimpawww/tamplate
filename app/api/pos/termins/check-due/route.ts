import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'

// Dipanggil saat halaman proyek dibuka — auto-update termin yang sudah jatuh tempo
export async function POST() {
  const session = await verifySession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const now = new Date()

  // Cari semua termin BELUM_DITAGIH yang tanggalJatuhTemponya sudah lewat
  const overdueTermins = await prisma.paymentTerm.findMany({
    where: {
      status: 'BELUM_DITAGIH',
      tanggalJatuhTempo: { lte: now },
    },
  })

  if (overdueTermins.length === 0) return NextResponse.json({ updated: 0 })

  // Auto-update ke MENUNGGU_PEMBAYARAN
  await prisma.paymentTerm.updateMany({
    where: {
      id: { in: overdueTermins.map(t => t.id) },
    },
    data: {
      status: 'MENUNGGU_PEMBAYARAN',
      tanggalTagih: now,
    },
  })

  return NextResponse.json({ updated: overdueTermins.length })
}
