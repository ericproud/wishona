import Image from 'next/image'
import type { ReactNode } from 'react'

type Props = {
  imageUrl: string | null
  name: string
  price: number | null
  quantity?: number
  url?: string | null
  notes?: string | null
  topRight?: ReactNode
  meta?: ReactNode
  footer?: ReactNode
  dimmed?: boolean
  className?: string
}

export default function ItemTile({
  imageUrl,
  name,
  price,
  quantity = 1,
  url,
  notes,
  topRight,
  meta,
  footer,
  dimmed,
  className,
}: Props) {
  return (
    <div
      className={`bg-card border border-border rounded-lg overflow-hidden flex flex-col transition-all hover:border-foreground/20 hover:shadow-sm ${
        dimmed ? 'opacity-60' : ''
      } ${className ?? ''}`}
    >
      <div className="aspect-square bg-muted relative">
        {imageUrl ? (
          <Image src={imageUrl} alt="" fill className="object-contain p-3" unoptimized />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted via-muted to-muted/40">
            <svg className="w-9 h-9 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.25} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {quantity > 1 && (
          <span className="absolute top-2 left-2 text-[11px] font-medium bg-foreground/85 text-background px-1.5 py-0.5 rounded">
            ×{quantity}
          </span>
        )}
        {topRight && <div className="absolute top-2 right-2">{topRight}</div>}
      </div>
      <div className="p-3 flex flex-col flex-1 gap-1">
        <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug">{name}</p>
        {(price !== null || url) && (
          <div className="flex items-center gap-2 text-xs">
            {price !== null && <span className="font-semibold text-foreground">${price.toFixed(2)}</span>}
            {price !== null && url && <span className="text-border">·</span>}
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline truncate"
              >
                View link
              </a>
            )}
          </div>
        )}
        {notes && <p className="text-xs text-muted-foreground line-clamp-2">{notes}</p>}
        {meta && <div className="text-xs text-muted-foreground space-y-0.5 pt-1">{meta}</div>}
        {footer && <div className="mt-auto pt-3">{footer}</div>}
      </div>
    </div>
  )
}
