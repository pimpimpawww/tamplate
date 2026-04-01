'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, X, Pencil, Trash2, Shield, User, HardHat } from 'lucide-react'

type AppUser = { id: string; email: string; role: string; createdAt: string }

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: any; desc: string }> = {
  OWNER: { label: 'Owner', color: 'bg-purple-100 text-purple-700', icon: Shield, desc: 'Akses penuh + laporan keuangan + karyawan' },
  ADMIN: { label: 'Admin', color: 'bg-blue-100 text-blue-700', icon: User, desc: 'Kelola proyek & laporan keuangan' },
  PENGAWAS: { label: 'Pengawas', color: 'bg-orange-100 text-orange-700', icon: HardHat, desc: 'Input pengeluaran & update progres' },
}

export function UserManagementClient({ users: initial, currentUserId }: { users: AppUser[]; currentUserId: string }) {
  const router = useRouter()
  const [users, setUsers] = useState(initial)
  const [showModal, setShowModal] = useState(false)
  const [editUser, setEditUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({ email: '', password: '', role: 'ADMIN' })

  function openAdd() {
    setEditUser(null)
    setForm({ email: '', password: '', role: 'ADMIN' })
    setError(''); setSuccess('')
    setShowModal(true)
  }

  function openEdit(u: AppUser) {
    setEditUser(u)
    setForm({ email: u.email, password: '', role: u.role })
    setError(''); setSuccess('')
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')

    if (editUser) {
      // Update
      const res = await fetch('/api/users/update', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: editUser.id, email: form.email, role: form.role, password: form.password || undefined }),
      })
      const data = await res.json()
      if (data.success) {
        setUsers(p => p.map(u => u.id === editUser.id ? { ...u, email: form.email, role: form.role } : u))
        setSuccess('User berhasil diupdate')
        setTimeout(() => setShowModal(false), 800)
      } else setError(data.message)
    } else {
      // Create
      const res = await fetch('/api/users/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        router.refresh()
        setSuccess('User berhasil dibuat')
        setTimeout(() => { setShowModal(false); window.location.reload() }, 800)
      } else setError(data.message)
    }
    setLoading(false)
  }

  async function handleDelete(u: AppUser) {
    if (u.id === currentUserId) { alert('Tidak bisa hapus akun sendiri'); return }
    if (!confirm(`Hapus user ${u.email}?`)) return
    setLoading(true)
    const res = await fetch('/api/users/delete', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: u.id }),
    })
    const data = await res.json()
    if (data.success) setUsers(p => p.filter(x => x.id !== u.id))
    else alert(data.message)
    setLoading(false)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wide" style={{ color: '#1e2328' }}>Manajemen User</h1>
          <p className="text-sm" style={{ color: '#6b7c4a' }}>{users.length} user terdaftar</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: '#6b7c4a' }}>
          <Plus className="h-4 w-4" /> Tambah User
        </button>
      </div>

      {/* Role legend */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Object.entries(ROLE_CONFIG).map(([role, cfg]) => (
          <div key={role} className="flex items-center gap-3 p-3 rounded-lg border bg-white">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${cfg.color}`}>
              <cfg.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">{cfg.label}</p>
              <p className="text-xs text-muted-foreground">{cfg.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* User list */}
      <div className="space-y-2">
        {users.map(u => {
          const cfg = ROLE_CONFIG[u.role] ?? ROLE_CONFIG['ADMIN']
          const isSelf = u.id === currentUserId
          return (
            <Card key={u.id} className={isSelf ? 'border-[#6b7c4a]' : ''}>
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${cfg.color}`}>
                    {u.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm truncate">{u.email}</p>
                      {isSelf && <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">Anda</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>{cfg.label}</span>
                      <span className="text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => openEdit(u)}
                    className="p-2 rounded-lg border hover:bg-gray-50 transition-colors">
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  {!isSelf && (
                    <button onClick={() => handleDelete(u)} disabled={loading}
                      className="p-2 rounded-lg border hover:bg-red-50 transition-colors">
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold">{editUser ? 'Edit User' : 'Tambah User Baru'}</h2>
              <button onClick={() => setShowModal(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {error && <div className="text-sm p-3 rounded-lg" style={{ background: 'rgba(248,113,113,0.1)', color: '#ef4444' }}>{error}</div>}
              {success && <div className="text-sm p-3 rounded-lg" style={{ background: 'rgba(107,124,74,0.1)', color: '#6b7c4a' }}>{success}</div>}

              <div className="space-y-1">
                <label className="text-sm font-medium">Email *</label>
                <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="user@fidyatama.com" required />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">{editUser ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password *'}</label>
                <Input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" minLength={6} required={!editUser} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Role *</label>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(ROLE_CONFIG).map(([role, cfg]) => (
                    <label key={role} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${form.role === role ? 'border-[#6b7c4a] bg-[#6b7c4a]/5' : 'hover:bg-gray-50'}`}>
                      <input type="radio" name="role" value={role} checked={form.role === role} onChange={() => setForm(p => ({ ...p, role }))} className="shrink-0" />
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${cfg.color}`}>
                        <cfg.icon className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{cfg.label}</p>
                        <p className="text-xs text-muted-foreground">{cfg.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pb-1">
                <button type="submit" disabled={loading}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: '#6b7c4a' }}>
                  {loading ? 'Menyimpan...' : editUser ? 'Update' : 'Buat User'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-lg text-sm border">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
