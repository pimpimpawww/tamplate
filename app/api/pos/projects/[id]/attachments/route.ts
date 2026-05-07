import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: projectId } = await params

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const kategori = formData.get('kategori') as string || 'LAINNYA'

  if (!file) return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 })

  const maxSize = 20 * 1024 * 1024 // 20MB
  if (file.size > maxSize) return NextResponse.json({ error: 'Ukuran file maksimal 20MB' }, { status: 400 })

  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  const allowed = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'dwg', 'xlsx', 'xls', 'docx', 'doc']
  if (!allowed.includes(ext)) return NextResponse.json({ error: 'Tipe file tidak didukung' }, { status: 400 })

  const tipe = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? 'image' : ext === 'pdf' ? 'pdf' : 'document'

  const buffer = Buffer.from(await file.arrayBuffer())
  const fileName = `${projectId}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const uploadDir = join(process.cwd(), 'public', 'uploads', 'projects', projectId)

  await mkdir(uploadDir, { recursive: true })
  await writeFile(join(uploadDir, fileName), buffer)

  const url = `/uploads/projects/${projectId}/${fileName}`

  const attachment = await prisma.projectAttachment.create({
    data: { projectId, namaFile: file.name, url, tipe, ukuran: file.size, kategori },
  })

  return NextResponse.json(attachment, { status: 201 })
}
