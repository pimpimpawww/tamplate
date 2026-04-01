import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'
import { serialize } from '@/lib/serialize'
import { CatalogClient } from './CatalogClient'

export default async function CatalogPage() {
  const session = await verifySession()
  if (!session) redirect('/login')

  const catalogs = await prisma.serviceCatalog.findMany({ orderBy: { nama: 'asc' } })
  return <CatalogClient initialData={serialize(catalogs) as any} />
}
