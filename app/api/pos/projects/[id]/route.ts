import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      customer: true,
      attachments: true,
      contract: {
        include: {
          items: { include: { service: true } },
          termins: { orderBy: { createdAt: 'asc' } },
          expenses: { orderBy: { tanggal: 'desc' } },
        },
      },
    },
  })

  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(project)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const project = await prisma.project.update({
    where: { id },
    data: body,
  })
  return NextResponse.json(project)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const project = await prisma.project.findUnique({ where: { id } })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (project.status !== 'DRAFT') return NextResponse.json({ error: 'Hanya proyek DRAFT yang bisa dihapus' }, { status: 400 })

  await prisma.project.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
