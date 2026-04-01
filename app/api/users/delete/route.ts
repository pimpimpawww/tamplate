import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const DeleteUserSchema = z.object({
  userId: z.string(),
})

export async function DELETE(request: Request) {
  try {
    const session = await verifySession()
    if (!session || session.role !== 'OWNER') {
      return NextResponse.json({ success: false, message: 'Hanya Owner yang bisa menghapus user' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = DeleteUserSchema.safeParse(body)

    if (!validatedData.success) {
      return NextResponse.json(
        { success: false, message: 'Data tidak valid' },
        { status: 400 }
      )
    }

    const { userId } = validatedData.data

    // Prevent admin from deleting themselves
    if (userId === session.userId) {
      return NextResponse.json(
        { success: false, message: 'Tidak bisa menghapus akun sendiri' },
        { status: 400 }
      )
    }

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

    // Delete user
    await prisma.user.delete({
      where: { id: userId },
    })

    return NextResponse.json({
      success: true,
      message: 'User berhasil dihapus',
    })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
