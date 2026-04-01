import { NextResponse } from 'next/server'
import { deleteSession } from '@/lib/session'

export async function GET() {
  await deleteSession()
  return NextResponse.redirect(new URL('/login', process.env.NEXTAUTH_URL ?? 'http://localhost:3000'))
}
