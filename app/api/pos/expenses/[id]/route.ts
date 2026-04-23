import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'
import { Permissions } from '@/lib/permissions'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!Permissions.canInputExpense(session.role))
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })

  const { id } = await params
  await prisma.expense.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
