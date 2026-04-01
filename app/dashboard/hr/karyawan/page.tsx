import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'
import { serialize } from '@/lib/serialize'
import { Permissions } from '@/lib/permissions'
import { KaryawanClient } from './KaryawanClient'

export default async function KaryawanPage() {
  const session = await verifySession()
  if (!session) redirect('/login')
  if (!Permissions.canManageHR(session.role)) redirect('/dashboard')

  const karyawan = await prisma.karyawan.findMany({
    orderBy: { nama: 'asc' },
    include: { _count: { select: { penugasan: true, upah: true } } },
  })

  return <KaryawanClient initialData={serialize(karyawan) as any} />
}
