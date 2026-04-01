import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const data = await prisma.karyawan.findUnique({
    where: { id },
    include: {
      penugasan: { include: { project: { select: { projectId: true, namaProyek: true, status: true } } }, orderBy: { createdAt: 'desc' } },
      upah: { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const data = await prisma.karyawan.update({ where: { id }, data: body })
  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession()
  if (!session || session.role !== 'OWNER') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await prisma.karyawan.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
