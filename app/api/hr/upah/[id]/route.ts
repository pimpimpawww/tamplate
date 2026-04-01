import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()

  const data: any = { status: body.status }
  if (body.status === 'SUDAH_DIBAYAR') data.tanggalBayar = new Date()

  const updated = await prisma.catatanUpah.update({ where: { id }, data })
  return NextResponse.json(updated)
}
