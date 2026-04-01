'use client'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { FidyatamaLogo } from './FidyatamaLogo'

type NavItem = { href: string; label: string; icon: React.ReactNode }

type Props = {
  mainNav: NavItem[]
  posNav: NavItem[]
  hrNav: NavItem[]
  isAdmin: boolean
}

export function MobileSidebarToggle({ mainNav, posNav, hrNav, isAdmin }: Props) {
  const [open, setOpen] = useState(false)

  // Close on route change
  useEffect(() => {
    const close = () => setOpen(false)
    window.addEventListener('popstate', close)
    return () => window.removeEventListener('popstate', close)
  }, [])

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg transition-colors hover:bg-white/10"
        aria-label="Buka menu"
      >
        <Menu className="w-5 h-5 text-white" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full z-50 flex flex-col w-64 transition-transform duration-300 md:hidden ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: '#1e2328' }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 h-14 shrink-0" style={{ borderBottom: '1px solid #2d3339' }}>
          <FidyatamaLogo variant="light" size="sm" />
          <button onClick={() => setOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10">
            <X className="w-4 h-4 text-white/70" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5 pt-4">
          <p className="sidebar-section-label">Menu</p>
          {mainNav.map(item => (
            <a key={item.href} href={item.href} className="sidebar-item" onClick={() => setOpen(false)}>
              {item.icon}
              <span>{item.label}</span>
            </a>
          ))}

          {isAdmin && (
            <a href="/dashboard/users" className="sidebar-item" onClick={() => setOpen(false)}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>User Management</span>
            </a>
          )}

          <div className="pt-3">
            <hr className="mb-3" style={{ borderColor: '#2d3339' }} />
            <p className="sidebar-section-label">POS Properti</p>
            {posNav.map(item => (
              <a key={item.href} href={item.href} className="sidebar-item" onClick={() => setOpen(false)}>
                {item.icon}
                <span>{item.label}</span>
              </a>
            ))}
          </div>

          <div className="pt-3">
            <hr className="mb-3" style={{ borderColor: '#2d3339' }} />
            <p className="sidebar-section-label">SDM & Karyawan</p>
            {hrNav.map(item => (
              <a key={item.href} href={item.href} className="sidebar-item" onClick={() => setOpen(false)}>
                {item.icon}
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        </nav>

        <div className="p-4" style={{ borderTop: '1px solid #2d3339' }}>
          <p className="text-[10px] text-center" style={{ color: '#4a5568' }}>© 2026 Fidyatama. All Rights Reserved</p>
        </div>
      </div>
    </>
  )
}
