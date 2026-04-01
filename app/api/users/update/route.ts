import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const UpdateUserSchema = z.object({
  userId: z.string(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(['OWNER', 'ADMIN', 'PENGAWAS']).optional(),
})

export async function PUT(request: Request) {
  try {
    const session = await verifySession()
    if (!session || session.role !== 'OWNER') {
      return NextResponse.json({ success: false, message: 'Hanya Owner yang bisa mengubah user' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = UpdateUserSchema.safeParse(body)

    if (!validatedData.success) {
      return NextResponse.json(
        { success: false, message: 'Data tidak valid' },
        { status: 400 }
      )
    }

    const { userId, email, password, role } = validatedData.data

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: 'User tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if email is already taken by another user
    if (email && email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email },
      })

      if (emailTaken) {
        return NextResponse.json(
          { success: false, message: 'Email sudah digunakan user lain' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {}
    if (email) updateData.email = email
    if (role) updateData.role = role
    if (password) {
      updateData.password = await hash(password, 12)
    }

    // Update user
    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      message: 'User berhasil diupdate',
    })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
