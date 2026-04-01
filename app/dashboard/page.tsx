import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'
import Image from 'next/image'
import Link from 'next/link'
import { ROLE_LABELS, Permissions } from '@/lib/permissions'
import { FileText, Users, Package, ArrowRight } from 'lucide-react'

export default async function DashboardPage() {
  const session = await verifySession()
  if (!session) redirect('/login')

  const profile = await prisma.profile.findUnique({
    where: { userId: session.userId },
  })

  const roleInfo = ROLE_LABELS[session.role] ?? ROLE_LABELS['ADMIN']

  const [totalProyek, totalKaryawan, totalPelanggan] = await Promise.all([
    prisma.project.count(),
    prisma.karyawan.count({ where: { status: 'AKTIF' } }),
    prisma.customer.count(),
  ])

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="rounded-xl p-6 flex items-center gap-5" style={{ background: '#1e2328' }}>
        {profile?.fotoProfil ? (
          <div className="relative w-16 h-16 rounded-full overflow-hidden ring-4 ring-[#6b7c4a] shrink-0">
            <Image src={profile.fotoProfil} alt="Profile" fill className="object-cover" unoptimized />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black text-white shrink-0 ring-4 ring-[#6b7c4a]"
            style={{ background: '#6b7c4a' }}>
            {session.email.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-sm" style={{ color: '#a8b89a' }}>Selamat datang kembali,</p>
          <h1 className="text-xl font-bold text-white truncate">{session.email}</h1>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${roleInfo.color}`}>
            {roleInfo.label}
          </span>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Proyek', value: totalProyek, icon: FileText, href: '/dashboard/pos/projects' },
          { label: 'Karyawan Aktif', value: totalKaryawan, icon: Users, href: '/dashboard/hr/karyawan' },
          { label: 'Pelanggan', value: totalPelanggan, icon: Package, href: '/dashboard/pos/customers' },
        ].map(s => (
          <Link key={s.href} href={s.href}>
            <div className="rounded-xl p-4 border hover:shadow-md transition-shadow cursor-pointer" style={{ background: 'white' }}>
              <s.icon className="h-5 w-5 mb-2" style={{ color: '#6b7c4a' }} />
              <p className="text-2xl font-black" style={{ color: '#1e2328' }}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Shortcuts */}
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#6b7c4a' }}>Akses Cepat</p>
        {[
          { href: '/dashboard/pos', label: 'Dashboard POS', desc: 'Ringkasan keuangan & proyek', show: true },
          { href: '/dashboard/pos/projects', label: 'Manajemen Proyek', desc: 'Lihat & kelola semua proyek', show: true },
          { href: '/dashboard/hr/karyawan', label: 'Manajemen Karyawan', desc: 'Data, penugasan & upah karyawan', show: Permissions.canManageHR(session.role) },
        ].filter(a => a.show).map(a => (
          <Link key={a.href} href={a.href}>
            <div className="flex items-center justify-between p-4 rounded-xl border hover:border-[#6b7c4a] hover:bg-[#6b7c4a]/5 transition-all cursor-pointer bg-white">
              <div>
                <p className="font-semibold text-sm">{a.label}</p>
                <p className="text-xs text-muted-foreground">{a.desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
