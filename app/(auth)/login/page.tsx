'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loginAction } from '@/app/actions/auth-actions'
import { FidyatamaLogo } from '@/components/FidyatamaLogo'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    fetch('/api/auth/check')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) router.push('/dashboard')
        else setChecking(false)
      })
      .catch(() => setChecking(false))
  }, [router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await loginAction(null, new FormData(e.currentTarget))
    if (result.success) {
      router.push('/dashboard')
      router.refresh()
    } else if (result.message) {
      setError(result.message)
    }
    setLoading(false)
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1e2328' }}>
        <div className="w-6 h-6 border-2 border-[#6b7c4a] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#1e2328' }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <FidyatamaLogo variant="light" size="lg" />
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8 shadow-2xl" style={{ background: '#262d34', border: '1px solid #2d3339' }}>
          <div className="mb-6 text-center">
            <h2 className="text-lg font-bold text-white">Selamat Datang</h2>
            <p className="text-sm mt-1" style={{ color: '#6b7c4a' }}>Masuk ke Fidyatama Access</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-sm p-3 rounded-lg" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: '#a8b89a' }}>Email</label>
              <input
                name="email"
                type="email"
                placeholder="nama@email.com"
                required
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2"
                style={{ background: '#1e2328', border: '1px solid #3d4449' }}
                onFocus={e => e.target.style.borderColor = '#6b7c4a'}
                onBlur={e => e.target.style.borderColor = '#3d4449'}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: '#a8b89a' }}>Password</label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none"
                style={{ background: '#1e2328', border: '1px solid #3d4449' }}
                onFocus={e => e.target.style.borderColor = '#6b7c4a'}
                onBlur={e => e.target.style.borderColor = '#3d4449'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-60 mt-2"
              style={{ background: '#6b7c4a' }}
            >
              {loading ? 'Masuk...' : 'Masuk'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#4a5568' }}>
          © 2026 Fidyatama. All Rights Reserved
        </p>
      </div>
    </div>
  )
}
