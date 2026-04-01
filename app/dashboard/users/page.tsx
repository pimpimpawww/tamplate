import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'
import { UserManagementClient } from './UserManagementClient'

export default async function UsersPage() {
  const session = await verifySession()
  if (!session) redirect('/login')
  if (session.role !== 'OWNER') redirect('/dashboard')

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, email: true, role: true, createdAt: true },
  })

  return <UserManagementClient users={users as any} currentUserId={session.userId} />
}
