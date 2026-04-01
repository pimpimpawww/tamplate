import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'
import { NewProjectForm } from './NewProjectForm'

export default async function NewProjectPage() {
  const session = await verifySession()
  if (!session) redirect('/login')

  const customers = await prisma.customer.findMany({ orderBy: { nama: 'asc' } })
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Buat Proyek Baru</h1>
        <p className="text-sm text-muted-foreground">Isi data proyek dan pelanggan</p>
      </div>
      <NewProjectForm customers={customers} />
    </div>
  )
}
