import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'
import Image from 'next/image'
import AIAssistantWidget from '@/components/AIAssistantWidget'
import { FidyatamaLogo } from '@/components/FidyatamaLogo'
import { LogoutButton } from '@/components/LogoutButton'
import { MobileSidebarToggle } from '@/components/MobileSidebarToggle'
import { Permissions, ROLE_LABELS } from '@/lib/permissions'

const mainNav = [
  {
    href: '/dashboard', label: 'Dashboard',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  },
  {
    href: '/dashboard/profile', label: 'Profil Saya',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession()
  if (!session) redirect('/login')

  const profile = await prisma.profile.findUnique({ where: { userId: session.userId } })
  const isAdmin = session.role === 'OWNER'
  const roleInfo = ROLE_LABELS[session.role] ?? ROLE_LABELS['ADMIN']

  // posNav filtered by role — defined inside function to access session
  const posNav = [
    {
      href: '/dashboard/pos', label: 'Dashboard POS',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    },
    {
      href: '/dashboard/pos/projects', label: 'Proyek',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    },
    ...(Permissions.canCreateProject(session.role) ? [{
      href: '/dashboard/pos/customers', label: 'Pelanggan',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    }] : []),
    ...(Permissions.canViewCatalog(session.role) ? [{
      href: '/dashboard/pos/catalog', label: 'Katalog Jasa',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
    }] : []),
  ]

  const hrNav = Permissions.canManageHR(session.role) ? [
    {
      href: '/dashboard/hr/karyawan', label: 'Karyawan',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    },
  ] : []

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f4f4f2' }}>

      {/* Top Navbar */}
      <header style={{ background: '#1e2328', borderBottom: '1px solid #2d3339' }} className="h-14 flex items-center px-3 sm:px-4 gap-3 shrink-0 z-20">

        {/* Mobile hamburger */}
        <MobileSidebarToggle mainNav={mainNav} posNav={posNav} hrNav={hrNav} isAdmin={isAdmin} />

        {/* Logo — hidden on mobile (shown in drawer), visible md+ */}
        <div className="hidden md:block">
          <FidyatamaLogo variant="light" size="sm" />
        </div>

        {/* Logo on mobile center */}
        <div className="md:hidden flex-1 flex justify-center">
          <FidyatamaLogo variant="light" size="sm" />
        </div>

        <div className="hidden md:block flex-1" />

        {/* Profile */}
        <a href="/dashboard/profile" className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors hover:bg-white/10">
          {profile?.fotoProfil ? (
            <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-[#6b7c4a]">
              <Image src={profile.fotoProfil} alt="Profile" fill className="object-cover" unoptimized />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ring-2 ring-[#6b7c4a]" style={{ background: '#6b7c4a' }}>
              {session.email.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="hidden sm:flex flex-col leading-none">
            <span className="text-xs font-medium text-white/90 max-w-[120px] truncate">{session.email}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full mt-0.5 font-medium ${roleInfo.color}`}>{roleInfo.label}</span>
          </div>
        </a>

        <div className="w-px h-6" style={{ background: '#2d3339' }} />
        <LogoutButton />
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar — desktop only */}
        <aside className="hidden md:flex w-56 shrink-0 flex-col overflow-y-auto" style={{ background: '#1e2328', borderRight: '1px solid #2d3339' }}>
          <nav className="flex-1 p-3 space-y-0.5 pt-4">
            <p className="sidebar-section-label">Menu</p>
            {mainNav.map(item => (
              <a key={item.href} href={item.href} className="sidebar-item">
                {item.icon}<span>{item.label}</span>
              </a>
            ))}
            {isAdmin && (
              <a href="/dashboard/users" className="sidebar-item">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                <span>User Management</span>
              </a>
            )}
            <div className="pt-3">
              <hr className="mb-3" style={{ borderColor: '#2d3339' }} />
              <p className="sidebar-section-label">POS Properti</p>
              {posNav.map(item => (
                <a key={item.href} href={item.href} className="sidebar-item">
                  {item.icon}<span>{item.label}</span>
                </a>
              ))}
            </div>

            {/* HR */}
            <div className="pt-3">
              <hr className="mb-3" style={{ borderColor: '#2d3339' }} />
              <p className="sidebar-section-label">SDM & Karyawan</p>
              {hrNav.map(item => (
                <a key={item.href} href={item.href} className="sidebar-item">
                  {item.icon}<span>{item.label}</span>
                </a>
              ))}
            </div>
          </nav>
          <div className="p-4 border-t" style={{ borderColor: '#2d3339' }}>
            <p className="text-[10px] text-center" style={{ color: '#4a5568' }}>© 2026 Fidyatama. All Rights Reserved</p>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
          {children}
        </main>
      </div>

      <AIAssistantWidget />
    </div>
  )
}
