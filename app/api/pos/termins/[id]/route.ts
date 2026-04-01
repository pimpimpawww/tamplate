import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'
import { z } from 'zod'
import { Permissions } from '@/lib/permissions'

const schema = z.object({
  status: z.enum(['BELUM_DITAGIH', 'MENUNGGU_PEMBAYARAN', 'LUNAS']),
  tanggalTagih: z.string().optional(),
  tanggalBayar: z.string().optional(),
  catatan: z.string().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!Permissions.canUpdateTermin(session.role))
    return NextResponse.json({ error: 'Akses ditolak. Hanya Owner dan Admin.' }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const data: any = { status: parsed.data.status, catatan: parsed.data.catatan }
  if (parsed.data.tanggalTagih) data.tanggalTagih = new Date(parsed.data.tanggalTagih)
  if (parsed.data.tanggalBayar) data.tanggalBayar = new Date(parsed.data.tanggalBayar)

  const termin = await prisma.paymentTerm.update({ where: { id }, data })
  return NextResponse.json(termin)
}
