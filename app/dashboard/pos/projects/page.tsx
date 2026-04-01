import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, FileText, MapPin } from 'lucide-react'

const STATUS_COLOR: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  AKTIF: 'bg-blue-100 text-blue-700',
  SELESAI: 'bg-green-100 text-green-700',
  BATAL: 'bg-red-100 text-red-700',
}

function formatRupiah(n: number | string) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(n))
}

export default async function ProjectsPage() {
  const session = await verifySession()
  if (!session) redirect('/login')

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      customer: true,
      contract: { include: { termins: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Proyek</h1>
          <p className="text-sm text-muted-foreground">{projects.length} proyek</p>
        </div>
        <Link href="/dashboard/pos/projects/new">
          <Button><Plus className="h-4 w-4 mr-2" /> Buat Proyek</Button>
        </Link>
      </div>

      <div className="space-y-3">
        {projects.map(p => {
          const lunas = p.contract?.termins.filter(t => t.status === 'LUNAS').reduce((s, t) => s + Number(t.jumlah), 0) ?? 0
          const total = Number(p.contract?.nilaiKontrak ?? 0)
          const pct = total > 0 ? Math.round((lunas / total) * 100) : 0

          return (
            <Link key={p.id} href={`/dashboard/pos/projects/${p.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">{p.projectId}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[p.status]}`}>{p.status}</span>
                      </div>
                      <p className="font-semibold">{p.namaProyek}</p>
                      <p className="text-sm text-muted-foreground">{p.customer.nama} · {p.customer.noWa}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />{p.alamatProyek}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {p.contract ? (
                        <>
                          <p className="font-bold text-green-700">{formatRupiah(Number(p.contract.nilaiKontrak))}</p>
                          <p className="text-xs text-muted-foreground">{pct}% lunas</p>
                          <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1">
                            <div className="h-1.5 bg-green-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Belum ada kontrak</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
        {projects.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Belum ada proyek. Buat proyek pertama Anda.</p>
          </div>
        )}
      </div>
    </div>
  )
}
