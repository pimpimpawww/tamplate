import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'
import { z } from 'zod'

const schema = z.object({
  nama: z.string().min(1),
  nik: z.string().optional(),
  jabatan: z.enum(['MANDOR','TUKANG','KENEK','DESAINER','SURVEYOR','ADMIN_KANTOR','LAINNYA']),
  noHp: z.string().optional(),
  alamat: z.string().optional(),
  gajiPokok: z.number().optional(),
  tanggalMasuk: z.string().optional(),
  catatan: z.string().optional(),
})

export async function GET() {
  const session = await verifySession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'OWNER') return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })

  const data = await prisma.karyawan.findMany({
    orderBy: { nama: 'asc' },
    include: {
      _count: { select: { penugasan: true, upah: true } },
    },
  })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const session = await verifySession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'OWNER') return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { gajiPokok, tanggalMasuk, ...rest } = parsed.data
  const karyawan = await prisma.karyawan.create({
    data: {
      ...rest,
      gajiPokok: gajiPokok ?? null,
      tanggalMasuk: tanggalMasuk ? new Date(tanggalMasuk) : null,
    },
  })
  return NextResponse.json(karyawan, { status: 201 })
}
