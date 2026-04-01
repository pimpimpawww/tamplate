import { redirect, notFound } from 'next/navigation'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'
import { serialize } from '@/lib/serialize'
import { ProjectDetailClient } from './ProjectDetailClient'

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession()
  if (!session) redirect('/login')

  const { id } = await params

  const [project, catalogs] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
      include: {
        customer: true,
        attachments: true,
        contract: {
          include: {
            items: { include: { service: true } },
            termins: { orderBy: { createdAt: 'asc' } },
            expenses: { orderBy: { tanggal: 'desc' } },
          },
        },
      },
    }),
    prisma.serviceCatalog.findMany({ where: { aktif: true }, orderBy: { nama: 'asc' } }),
  ])

  if (!project) notFound()

  return <ProjectDetailClient project={serialize(project) as any} catalogs={serialize(catalogs) as any} />
}
