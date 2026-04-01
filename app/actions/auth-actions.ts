'use server'

import { z } from 'zod'
import { hash, compare } from 'bcryptjs'
import { createSession, deleteSession } from '@/lib/session'
import prisma from '@/lib/prisma'

const LoginSchema = z.object({
  email: z.string().email({ message: 'Format email tidak valid' }),
  password: z.string().min(1, { message: 'Password harus diisi' }),
})

const RegisterSchema = z.object({
  email: z.string().email({ message: 'Format email tidak valid' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter' }),
  role: z.enum(['OWNER', 'ADMIN', 'PENGAWAS']).optional(),
  token: z.string().optional(),
})

export async function loginAction(prevState: any, formData: FormData) {
  const validatedFields = LoginSchema.safeParse(
    Object.fromEntries(formData.entries())
  )

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Data tidak valid.',
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedFields.data

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return { 
        success: false, 
        message: 'Email atau password salah.', 
        errors: null 
      }
    }

    const passwordMatch = await compare(password, user.password)
    
    if (!passwordMatch) {
      return { 
        success: false, 
        message: 'Email atau password salah.', 
        errors: null 
      }
    }

    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    return { 
      success: true, 
      role: user.role, 
      errors: null, 
      message: null 
    }
  } catch (error) {
    console.error('Login action failed:', error)
    const msg = error instanceof Error ? error.message : String(error)
    return { 
      success: false, 
      message: `Error: ${msg}`, 
      errors: null 
    }
  }
}

export async function registerAction(prevState: any, formData: FormData) {
  const validatedFields = RegisterSchema.safeParse(
    Object.fromEntries(formData.entries())
  )

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Data tidak valid.',
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password, role, token } = validatedFields.data

  // Verify token for secret registration
  if (token) {
    const validToken = process.env.REGISTRATION_TOKEN
    if (!validToken || token !== validToken) {
      return {
        success: false,
        message: 'Token registrasi tidak valid.',
        errors: null,
      }
    }
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { 
        success: false, 
        message: 'Email ini sudah terdaftar.', 
        errors: null 
      }
    }

    const passwordHash = await hash(password, 12)

    await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        role: (role as any) || 'ADMIN',
      },
    })

    return { 
      success: true, 
      message: 'Pendaftaran berhasil! Silakan login.', 
      errors: null 
    }
  } catch (error: any) {
    console.error('Registration failed:', error)
    return { 
      success: false, 
      message: 'Terjadi kesalahan saat pendaftaran.', 
      errors: null 
    }
  }
}

export async function logoutAction() {
  await deleteSession()
}
