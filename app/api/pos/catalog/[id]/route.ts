import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  // Soft delete - set aktif = false so existing contracts are not affected
  const catalog = await prisma.serviceCatalog.update({
    where: { id },
    data: { aktif: false },
  })
  return NextResponse.json(catalog)
}
