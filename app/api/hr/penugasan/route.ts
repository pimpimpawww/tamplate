import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'
import { z } from 'zod'

const schema = z.object({
  karyawanId: z.string().uuid(),
  projectId: z.string().uuid(),
  peran: z.string().optional(),
  tanggalMulai: z.string().optional(),
  tanggalSelesai: z.string().optional(),
  catatan: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await verifySession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { tanggalMulai, tanggalSelesai, ...rest } = parsed.data
  const data = await prisma.penugasanProyek.create({
    data: {
      ...rest,
      tanggalMulai: tanggalMulai ? new Date(tanggalMulai) : null,
      tanggalSelesai: tanggalSelesai ? new Date(tanggalSelesai) : null,
    },
    include: { karyawan: true, project: { select: { projectId: true, namaProyek: true } } },
  })
  return NextResponse.json(data, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await verifySession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  await prisma.penugasanProyek.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
