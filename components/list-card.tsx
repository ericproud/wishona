import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'

type Props = {
  href: string
  name: string
  metadata?: ReactNode
  coverImages: string[]
  actions?: ReactNode
  isPast?: boolean
}

export default function ListCard({ href, name, metadata, coverImages, actions, isPast }: Props) {
  const images = coverImages.filter(Boolean).slice(0, 4)

  return (
    <div className={`bg-card border border-border rounded-lg overflow-hidden hover:border-foreground/20 hover:shadow-sm transition-all group flex flex-col${isPast ? ' opacity-60' : ''}`}>
      <Link href={href} className="block">
        <div className="aspect-[4/3] bg-muted relative overflow-hidden">
          {images.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted via-muted to-muted/40">
              <svg className="w-12 h-12 text-muted-foreground/25" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.25} d="M20 12v9H4v-9M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
              </svg>
            </div>
          )}
          {images.length === 1 && (
            <Image
              src={images[0]}
              alt=""
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              unoptimized
            />
          )}
          {images.length === 2 && (
            <div className="absolute inset-0 grid grid-cols-2 gap-0.5 bg-border/40">
              {images.map((src, i) => (
                <div key={i} className="relative bg-muted overflow-hidden">
                  <Image src={src} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" unoptimized />
                </div>
              ))}
            </div>
          )}
          {images.length === 3 && (
            <div className="absolute inset-0 grid grid-cols-2 gap-0.5 bg-border/40">
              <div className="relative bg-muted overflow-hidden">
                <Image src={images[0]} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" unoptimized />
              </div>
              <div className="grid grid-rows-2 gap-0.5 bg-border/40">
                <div className="relative bg-muted overflow-hidden">
                  <Image src={images[1]} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" unoptimized />
                </div>
                <div className="relative bg-muted overflow-hidden">
                  <Image src={images[2]} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" unoptimized />
                </div>
              </div>
            </div>
          )}
          {images.length >= 4 && (
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5 bg-border/40">
              {images.slice(0, 4).map((src, i) => (
                <div key={i} className="relative bg-muted overflow-hidden">
                  <Image src={src} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" unoptimized />
                </div>
              ))}
            </div>
          )}
        </div>
      </Link>
      <div className="px-4 py-3 flex flex-col flex-1">
        <Link href={href} className="block">
          <p className="text-sm font-semibold text-foreground truncate hover:text-primary transition-colors">
            {name}
          </p>
        </Link>
        {metadata && <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{metadata}</div>}
        {actions && <div className="mt-3 pt-3 border-t border-border/60">{actions}</div>}
      </div>
    </div>
  )
}
