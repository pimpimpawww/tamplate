import { redirect, notFound } from 'next/navigation'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'
import { serialize } from '@/lib/serialize'
import { InvoicePrint } from './InvoicePrint'

export default async function InvoicePage({ params }: { params: Promise<{ terminId: string }> }) {
  const session = await verifySession()
  if (!session) redirect('/login')

  const { terminId } = await params

  const termin = await prisma.paymentTerm.findUnique({
    where: { id: terminId },
    include: {
      contract: {
        include: {
          items: { include: { service: true } },
          project: { include: { customer: true } },
        },
      },
    },
  })

  if (!termin) notFound()
  return <InvoicePrint termin={serialize(termin) as any} />
}
