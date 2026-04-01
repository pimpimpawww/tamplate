import { redirect, notFound } from 'next/navigation'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'
import { serialize } from '@/lib/serialize'
import { Permissions } from '@/lib/permissions'
import { KaryawanDetailClient } from './KaryawanDetailClient'

export default async function KaryawanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession()
  if (!session) redirect('/login')
  if (!Permissions.canManageHR(session.role)) redirect('/dashboard')

  const { id } = await params

  const [karyawan, projects] = await Promise.all([
    prisma.karyawan.findUnique({
      where: { id },
      include: {
        penugasan: {
          include: { project: { select: { id: true, projectId: true, namaProyek: true, status: true } } },
          orderBy: { createdAt: 'desc' },
        },
        upah: {
          include: { project: { select: { projectId: true, namaProyek: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    }),
    prisma.project.findMany({
      where: { status: { in: ['AKTIF', 'DRAFT'] } },
      select: { id: true, projectId: true, namaProyek: true },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  if (!karyawan) notFound()

  return <KaryawanDetailClient karyawan={serialize(karyawan) as any} projects={serialize(projects) as any} />
}
