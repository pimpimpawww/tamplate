import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'
import { z } from 'zod'

const schema = z.object({
  customerId: z.string().uuid(),
  namaProyek: z.string().min(1),
  alamatProyek: z.string().min(1),
  catatan: z.string().optional(),
})

/** Generate Project ID: PRJ-YYYY-NNN */
async function generateProjectId(): Promise<string> {
  const year = new Date().getFullYear()
  const count = await prisma.project.count({
    where: { projectId: { startsWith: `PRJ-${year}-` } },
  })
  const seq = String(count + 1).padStart(3, '0')
  return `PRJ-${year}-${seq}`
}

export async function GET(req: NextRequest) {
  const session = await verifySession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const projects = await prisma.project.findMany({
    where: status ? { status: status as any } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      customer: true,
      contract: {
        include: {
          termins: true,
          _count: { select: { expenses: true } },
        },
      },
      _count: { select: { attachments: true } },
    },
  })
  return NextResponse.json(projects)
}

export async function POST(req: NextRequest) {
  const session = await verifySession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const projectId = await generateProjectId()

  const project = await prisma.project.create({
    data: {
      ...parsed.data,
      projectId,
      createdById: session.userId,
    },
    include: { customer: true },
  })
  return NextResponse.json(project, { status: 201 })
}
