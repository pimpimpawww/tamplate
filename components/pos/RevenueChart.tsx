'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type ChartData = { bulan: string; pendapatan: number; biaya: number }

function formatShort(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}M`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}jt`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}rb`
  return String(n)
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
  return (
    <div style={{ background: '#2d3339', border: '1px solid #3d4449', borderRadius: 8 }} className="p-3 text-sm shadow-xl">
      <p className="font-semibold mb-1 text-white">{label}</p>
      <p style={{ color: '#a8b89a' }}>Pendapatan: {fmt(payload[0]?.value ?? 0)}</p>
      <p style={{ color: '#f87171' }}>Biaya: {fmt(payload[1]?.value ?? 0)}</p>
      <p style={{ color: '#fbbf24', borderTop: '1px solid #3d4449' }} className="pt-1 mt-1 font-medium">
        Profit: {fmt((payload[0]?.value ?? 0) - (payload[1]?.value ?? 0))}
      </p>
    </div>
  )
}

function CustomLegend({ payload }: any) {
  return (
    <div className="flex gap-4 justify-center mt-2">
      {payload?.map((p: any) => (
        <div key={p.value} className="flex items-center gap-1.5 text-xs" style={{ color: '#a8b89a' }}>
          <div className="w-3 h-3 rounded-sm" style={{ background: p.color }} />
          {p.value === 'pendapatan' ? 'Pendapatan' : 'Biaya'}
        </div>
      ))}
    </div>
  )
}

export function RevenueChart({ data }: { data: ChartData[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2d3339" vertical={false} />
        <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: '#6b7c4a' }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={formatShort} tick={{ fontSize: 10, fill: '#4a5568' }} width={44} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(107,124,74,0.08)' }} />
        <Legend content={<CustomLegend />} />
        <Bar dataKey="pendapatan" fill="#6b7c4a" radius={[4, 4, 0, 0]} maxBarSize={32} />
        <Bar dataKey="biaya" fill="#7f3d3d" radius={[4, 4, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  )
}
