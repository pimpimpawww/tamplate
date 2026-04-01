import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ terminId: string }> }) {
  const session = await verifySession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { terminId } = await params

  const termin = await prisma.paymentTerm.findUnique({
    where: { id: terminId },
    include: {
      contract: {
        include: {
          items: { include: { service: true } },
          project: { include: { customer: true } },
        },
      },
    },
  })

  if (!termin) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(termin)
}
