/**
 * Sistem permission berbasis role untuk Fidyatama POS
 *
 * OWNER     → akses penuh semua fitur + laporan keuangan lengkap
 * ADMIN     → akses POS penuh, TIDAK bisa lihat profit bersih & nilai kontrak
 * PENGAWAS  → hanya input pengeluaran & update status proyek
 */

export type AppRole = 'OWNER' | 'ADMIN' | 'PENGAWAS'

export const Permissions = {
  // Laporan keuangan sensitif (profit, nilai kontrak, total pendapatan)
  canViewFinancials: (role: string) => ['OWNER', 'ADMIN'].includes(role),

  // Bisa lihat daftar proyek & detail (tanpa angka sensitif)
  canViewProjects: (role: string) => ['OWNER', 'ADMIN', 'PENGAWAS'].includes(role),

  // Bisa buat proyek baru & kontrak
  canCreateProject: (role: string) => ['OWNER', 'ADMIN'].includes(role),

  // Bisa input pengeluaran / biaya operasional
  canInputExpense: (role: string) => ['OWNER', 'ADMIN', 'PENGAWAS'].includes(role),

  // Bisa update status termin (tagih / lunas)
  canUpdateTermin: (role: string) => ['OWNER', 'ADMIN'].includes(role),

  // Bisa update status proyek (progres lapangan)
  canUpdateProjectStatus: (role: string) => ['OWNER', 'ADMIN', 'PENGAWAS'].includes(role),

  // Bisa cetak invoice & kwitansi
  canPrintInvoice: (role: string) => ['OWNER', 'ADMIN'].includes(role),

  // Manajemen user (buat, hapus, edit role)
  canManageUsers: (role: string) => role === 'OWNER',

  // Bisa lihat katalog jasa
  canViewCatalog: (role: string) => ['OWNER', 'ADMIN'].includes(role),

  // Bisa edit katalog jasa
  canEditCatalog: (role: string) => ['OWNER', 'ADMIN'].includes(role),

  // Manajemen karyawan (lihat, tambah, edit, upah)
  canManageHR: (role: string) => role === 'OWNER',
} as const

/** Deskripsi role untuk UI */
export const ROLE_LABELS: Record<string, { label: string; desc: string; color: string }> = {
  OWNER: {
    label: 'Owner',
    desc: 'Akses penuh termasuk laporan keuangan & profit',
    color: 'bg-purple-100 text-purple-700',
  },
  ADMIN: {
    label: 'Admin',
    desc: 'Kelola proyek, kontrak & lihat laporan keuangan',
    color: 'bg-blue-100 text-blue-700',
  },
  PENGAWAS: {
    label: 'Pengawas Lapangan',
    desc: 'Input pengeluaran & update progres proyek, tanpa laporan keuangan',
    color: 'bg-orange-100 text-orange-700',
  },
}
