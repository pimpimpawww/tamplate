import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'
import { z } from 'zod'
import { Permissions } from '@/lib/permissions'

const schema = z.object({
  contractId: z.string().uuid(),
  kategori: z.enum(['MATERIAL', 'TUKANG', 'OPERASIONAL', 'LAINNYA']),
  deskripsi: z.string().min(1),
  jumlah: z.number().positive(),
  tanggal: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await verifySession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!Permissions.canInputExpense(session.role))
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const expense = await prisma.expense.create({
    data: {
      ...parsed.data,
      tanggal: parsed.data.tanggal ? new Date(parsed.data.tanggal) : new Date(),
    },
  })
  return NextResponse.json(expense, { status: 201 })
}
