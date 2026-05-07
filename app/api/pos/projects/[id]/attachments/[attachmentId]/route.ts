import { NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import { join } from 'path'
import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; attachmentId: string }> }) {
  const session = await verifySession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { attachmentId } = await params

  const attachment = await prisma.projectAttachment.findUnique({ where: { id: attachmentId } })
  if (!attachment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Hapus file fisik
  try {
    const filePath = join(process.cwd(), 'public', attachment.url)
    await unlink(filePath)
  } catch {
    // File mungkin sudah tidak ada, lanjut hapus dari DB
  }

  await prisma.projectAttachment.delete({ where: { id: attachmentId } })
  return NextResponse.json({ success: true })
}
