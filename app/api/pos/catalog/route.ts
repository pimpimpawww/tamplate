import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'
import { z } from 'zod'

const schema = z.object({
  nama: z.string().min(1),
  deskripsi: z.string().optional(),
  satuan: z.enum(['PER_M2', 'PER_PAKET', 'PER_TITIK']),
  hargaDefault: z.number().positive(),
  aktif: z.boolean().optional().default(true),
})

export async function GET() {
  const session = await verifySession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const catalogs = await prisma.serviceCatalog.findMany({
    where: { aktif: true },
    orderBy: { nama: 'asc' },
  })
  return NextResponse.json(catalogs)
}

export async function POST(req: NextRequest) {
  const session = await verifySession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const catalog = await prisma.serviceCatalog.create({ data: parsed.data })
  return NextResponse.json(catalog, { status: 201 })
}
