import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'
import { z } from 'zod'

const terminSchema = z.object({
  namaTermin: z.string().min(1),
  persentase: z.number().min(0).max(100),
})

const itemSchema = z.object({
  serviceId: z.string().uuid(),
  deskripsi: z.string().nullable().optional(),
  volume: z.number().positive(),
  hargaSatuan: z.number().positive(),
})

const schema = z.object({
  projectId: z.string().uuid(),
  nilaiKontrak: z.number().positive(),
  tanggalMulai: z.string().optional(),
  tanggalSelesai: z.string().optional(),
  catatan: z.string().optional(),
  items: z.array(itemSchema).min(1),
  termins: z.array(terminSchema).min(1),
})

export async function POST(req: NextRequest) {
  const session = await verifySession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { items, termins, nilaiKontrak, projectId, tanggalMulai, tanggalSelesai, catatan } = parsed.data

  // Validasi total persentase = 100
  const totalPersen = termins.reduce((sum, t) => sum + t.persentase, 0)
  if (Math.abs(totalPersen - 100) > 0.01) {
    return NextResponse.json({ error: 'Total persentase termin harus 100%' }, { status: 400 })
  }

  const contract = await prisma.contract.create({
    data: {
      projectId,
      nilaiKontrak,
      tanggalMulai: tanggalMulai ? new Date(tanggalMulai) : null,
      tanggalSelesai: tanggalSelesai ? new Date(tanggalSelesai) : null,
      catatan,
      items: {
        create: items.map((item) => ({
          serviceId: item.serviceId,
          deskripsi: item.deskripsi,
          volume: item.volume,
          hargaSatuan: item.hargaSatuan,
          subtotal: item.volume * item.hargaSatuan,
        })),
      },
      termins: {
        create: termins.map((t) => ({
          namaTermin: t.namaTermin,
          persentase: t.persentase,
          jumlah: (nilaiKontrak * t.persentase) / 100,
        })),
      },
    },
    include: {
      items: { include: { service: true } },
      termins: true,
    },
  })

  // Update status proyek ke AKTIF
  await prisma.project.update({
    where: { id: projectId },
    data: { status: 'AKTIF' },
  })

  return NextResponse.json(contract, { status: 201 })
}
