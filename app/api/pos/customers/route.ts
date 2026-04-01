import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'
import { z } from 'zod'

const schema = z.object({
  nama: z.string().min(1),
  noWa: z.string().min(1),
  alamat: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
})

export async function GET() {
  const session = await verifySession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { projects: true } } },
  })
  return NextResponse.json(customers)
}

export async function POST(req: NextRequest) {
  const session = await verifySession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const customer = await prisma.customer.create({ data: parsed.data })
  return NextResponse.json(customer, { status: 201 })
}
