import { cn } from '@/lib/utils'

type Props = {
  variant?: 'light' | 'dark'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function FidyatamaLogo({ variant = 'light', size = 'md', className }: Props) {
  const textColor = variant === 'light' ? '#ffffff' : '#1e2328'
  const subColor = variant === 'light' ? '#a8b89a' : '#6b7c4a'
  const accentColor = '#6b7c4a'

  const sizes = {
    sm: { logo: 20, title: 14, sub: 8 },
    md: { logo: 28, title: 18, sub: 10 },
    lg: { logo: 40, title: 26, sub: 12 },
  }
  const s = sizes[size]

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      {/* Icon mark — stylized F + building silhouette */}
      <svg width={s.logo} height={s.logo} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Background square */}
        <rect width="40" height="40" rx="6" fill={accentColor} />
        {/* Building silhouette */}
        <rect x="8" y="18" width="6" height="14" fill="white" opacity="0.9" />
        <rect x="17" y="12" width="6" height="20" fill="white" />
        <rect x="26" y="22" width="6" height="10" fill="white" opacity="0.7" />
        {/* Roof lines */}
        <path d="M6 18 L11 10 L16 18" fill="white" opacity="0.9" />
        <path d="M15 12 L20 4 L25 12" fill="white" />
        <path d="M24 22 L29 16 L34 22" fill="white" opacity="0.7" />
      </svg>

      {/* Text */}
      <div className="flex flex-col leading-none">
        <span
          style={{ fontSize: s.title, color: textColor, fontWeight: 800, letterSpacing: '0.08em', lineHeight: 1 }}
          className="font-black uppercase tracking-widest"
        >
          FIDYATAMA
        </span>
        <span
          style={{ fontSize: s.sub, color: subColor, letterSpacing: '0.12em', lineHeight: 1.4 }}
          className="uppercase tracking-widest"
        >
          Design &amp; Build Contractor
        </span>
      </div>
    </div>
  )
}
