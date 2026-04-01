import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['OWNER', 'ADMIN', 'PENGAWAS']),
})

export async function POST(request: Request) {
  try {
    const session = await verifySession()
    // Hanya OWNER yang bisa buat user
    if (!session || session.role !== 'OWNER') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Hanya Owner yang bisa membuat user.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = CreateUserSchema.safeParse(body)

    if (!validatedData.success) {
      return NextResponse.json(
        { success: false, message: 'Data tidak valid' },
        { status: 400 }
      )
    }

    const { email, password, role } = validatedData.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }

    // Create user
    const passwordHash = await hash(password, 12)
    await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        role,
      },
    })

    return NextResponse.json({
      success: true,
      message: `User ${role.toLowerCase()} berhasil dibuat`,
    })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
