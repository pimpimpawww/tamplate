import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'
import { randomBytes } from 'crypto'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  // Generate token unik
  const token = randomBytes(16).toString('hex')

  const project = await prisma.project.update({
    where: { id },
    data: { publicToken: token },
  })

  return NextResponse.json({ token: project.publicToken })
}
