import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'

function formatRupiah(n: number | string) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(n))
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const termin = await prisma.paymentTerm.findUnique({
    where: { id },
    include: {
      contract: {
        include: {
          project: { include: { customer: true } },
        },
      },
    },
  })

  if (!termin) return NextResponse.json({ error: 'Termin tidak ditemukan' }, { status: 404 })

  const { customer } = termin.contract.project
  const noWa = customer.noWa.replace(/^0/, '62').replace(/\D/g, '')

  const jatuhTempo = termin.tanggalJatuhTempo
    ? new Date(termin.tanggalJatuhTempo).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : '-'

  const pesan =
    `Yth. Bapak/Ibu *${customer.nama}*,\n\n` +
    `Kami dari *Fidyatama Contractor* ingin menginformasikan bahwa tagihan pembayaran proyek Anda telah jatuh tempo.\n\n` +
    `📋 *Detail Tagihan:*\n` +
    `• Proyek: ${termin.contract.project.namaProyek}\n` +
    `• Termin: ${termin.namaTermin}\n` +
    `• Jumlah: *${formatRupiah(String(termin.jumlah))}*\n` +
    `• Jatuh Tempo: ${jatuhTempo}\n\n` +
    `Mohon segera melakukan pembayaran. Terima kasih atas kepercayaan Anda.\n\n` +
    `_Fidyatama Design, Build & Demolis Contractor_`

  const FONNTE_TOKEN = process.env.FONNTE_TOKEN
  if (!FONNTE_TOKEN) {
    return NextResponse.json({ error: 'FONNTE_TOKEN belum dikonfigurasi di environment variables' }, { status: 500 })
  }

  const res = await fetch('https://api.fonnte.com/send', {
    method: 'POST',
    headers: {
      'Authorization': FONNTE_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ target: noWa, message: pesan }),
  })

  const result = await res.json()

  if (!res.ok || result.status === false) {
    return NextResponse.json({ error: `Gagal kirim WA: ${result.reason ?? result.message ?? JSON.stringify(result)}` }, { status: 500 })
  }

  // Tandai reminder sudah dikirim
  await prisma.paymentTerm.update({
    where: { id },
    data: { reminderSent: true },
  })

  return NextResponse.json({ success: true, message: `Reminder terkirim ke ${noWa}` })
}
