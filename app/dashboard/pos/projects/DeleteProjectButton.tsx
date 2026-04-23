'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DeleteProjectButton({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Hapus proyek ini?')) return

    setLoading(true)
    const res = await fetch(`/api/pos/projects/${id}`, { method: 'DELETE' })
    const data = await res.json()

    if (!res.ok) {
      alert(data.error ?? 'Gagal menghapus proyek')
    } else {
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="text-red-500 border-red-200 hover:bg-red-50 hover:border-red-400 hover:text-red-700 text-xs gap-1"
      onClick={handleDelete}
      disabled={loading}
    >
      <Trash2 className="h-3 w-3" />
      {loading ? 'Menghapus...' : 'Hapus'}
    </Button>
  )
}
