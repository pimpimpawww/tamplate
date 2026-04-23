import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { _count: { select: { projects: true } } },
  })
  if (!customer) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (customer._count.projects > 0)
    return NextResponse.json({ error: 'Pelanggan memiliki proyek aktif, tidak bisa dihapus' }, { status: 400 })

  await prisma.customer.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
