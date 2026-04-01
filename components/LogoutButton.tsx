'use client'
import { logoutAction } from '@/app/actions/auth-actions'

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors hover:bg-red-500/10"
        style={{ color: '#f87171' }}
      >
        Logout
      </button>
    </form>
  )
}
