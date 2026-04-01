import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'
import { CustomersClient } from './CustomersClient'

export default async function CustomersPage() {
  const session = await verifySession()
  if (!session) redirect('/login')

  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { projects: true } } },
  })
  return <CustomersClient initialData={customers} />
}
