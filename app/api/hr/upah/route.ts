import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'
import { z } from 'zod'

const schema = z.object({
  karyawanId: z.string().uuid(),
  projectId: z.string().uuid().optional(),
  periode: z.string().min(1),
  jumlahHari: z.number().int().min(1),
  upahPerHari: z.number().positive(),
})

export async function POST(req: NextRequest) {
  const session = await verifySession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { jumlahHari, upahPerHari, ...rest } = parsed.data
  const totalUpah = jumlahHari * upahPerHari

  const data = await prisma.catatanUpah.create({
    data: { ...rest, jumlahHari, upahPerHari, totalUpah },
    include: { karyawan: { select: { nama: true } } },
  })
  return NextResponse.json(data, { status: 201 })
}

export async function GET(req: NextRequest) {
  const session = await verifySession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const karyawanId = searchParams.get('karyawanId')

  const data = await prisma.catatanUpah.findMany({
    where: karyawanId ? { karyawanId } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      karyawan: { select: { nama: true, jabatan: true } },
      project: { select: { projectId: true, namaProyek: true } },
    },
  })
  return NextResponse.json(data)
}
