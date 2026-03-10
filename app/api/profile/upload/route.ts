import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: Request) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File size exceeds 2MB limit.' },
        { status: 400 }
      )
    }

    // Verify user exists, if not return clear error
    const userExists = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true },
    })

    if (!userExists) {
      console.error('User not found:', session.userId, session.email)
      return NextResponse.json(
        { 
          success: false, 
          message: 'Session tidak valid. Silakan logout dan login kembali.',
          debug: {
            userId: session.userId,
            email: session.email,
          }
        },
        { status: 400 }
      )
    }

    // Check if profile exists and has old photo
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: session.userId },
    })

    // Delete old photo from file system if exists
    if (existingProfile?.fotoProfil) {
      try {
        const oldFilePath = join(process.cwd(), 'public', existingProfile.fotoProfil)
        if (existsSync(oldFilePath)) {
          await unlink(oldFilePath)
          console.log('Old photo deleted:', oldFilePath)
        }
      } catch (error) {
        console.error('Error deleting old photo:', error)
      }
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `avatar-${session.userId}-${Date.now()}.${fileExt}`
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars')
    const filePath = join(uploadDir, fileName)

    // Create directory if not exists
    const { mkdir } = await import('fs/promises')
    await mkdir(uploadDir, { recursive: true })

    // Save file to public/uploads/avatars
    await writeFile(filePath, buffer)
    console.log('File saved:', filePath)

    // Public URL path
    const publicUrl = `/uploads/avatars/${fileName}`

    // Upsert profile (update jika ada, create jika tidak ada)
    const profile = await prisma.profile.upsert({
      where: { userId: session.userId },
      update: { fotoProfil: publicUrl },
      create: {
        userId: session.userId,
        fotoProfil: publicUrl,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Photo uploaded successfully',
      url: publicUrl,
      profile,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to upload photo' },
      { status: 500 }
    )
  }
}
