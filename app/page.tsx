import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="bg-nav">
        <div className="max-w-[1100px] mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-white font-semibold text-sm tracking-tight">Wishona</span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-white/60 hover:text-white/90 transition-colors">
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-md transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-nav px-6 py-20 sm:py-24">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl font-semibold text-white tracking-tight leading-tight">
            Gifts they&apos;ll actually love.
          </h1>
          <p className="text-base sm:text-lg text-white/60 leading-relaxed max-w-lg mx-auto">
            Create a wishlist, invite the people in your life, and let them give with confidence — no duplicates, no guessing.
          </p>
          <div className="flex items-center justify-center gap-4 pt-2">
            <Link
              href="/signup"
              className={buttonVariants({ size: 'lg', className: 'bg-primary hover:bg-primary/90 text-white border-0' })}
            >
              Get started free
            </Link>
            <Link
              href="/login"
              className="text-sm text-white/60 hover:text-white/90 transition-colors"
            >
              Log in →
            </Link>
          </div>
        </div>
      </section>

      {/* Hero preview — floating list mockup that bridges nav and features */}
      <section className="bg-gradient-to-b from-nav via-nav to-background px-6 pb-12 sm:pb-20">
        <div className="max-w-[900px] mx-auto -mt-8">
          <div className="bg-card border border-border rounded-xl shadow-xl overflow-hidden">
            <div className="border-b border-border px-5 py-3 flex items-center justify-between bg-muted/40">
              <p className="text-xs font-semibold text-foreground">Sarah&apos;s birthday list</p>
              <span className="text-[10px] text-muted-foreground">12 items · 4 gifters</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-5">
              {[
                { tone: 'from-amber-100 to-amber-200', label: 'Linen throw' },
                { tone: 'from-rose-100 to-rose-200', label: 'Ceramic mug' },
                { tone: 'from-emerald-100 to-emerald-200', label: 'Cookbook' },
                { tone: 'from-blue-100 to-blue-200', label: 'Headphones' },
              ].map((it, i) => (
                <div key={it.label} className="border border-border rounded-lg overflow-hidden">
                  <div className={`aspect-square bg-gradient-to-br ${it.tone} relative flex items-center justify-center`}>
                    <span className="text-2xl">{['◉', '✦', '◐', '◇'][i]}</span>
                    {i === 1 && (
                      <span className="absolute top-1.5 right-1.5 text-[9px] font-medium bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                        Claimed
                      </span>
                    )}
                  </div>
                  <div className="px-2 py-1.5">
                    <p className="text-[11px] font-medium text-foreground truncate">{it.label}</p>
                    <p className="text-[10px] text-muted-foreground">${[42, 18, 28, 199][i]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-background flex-1 py-16 sm:py-20 px-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Why Wishona</p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">Made for the way you actually gift.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <FeatureCard
              title="Private by default"
              description="Your lists are invite-only. Share with exactly who you want, nothing more."
              visual={
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-card border border-border rounded-lg p-3 w-3/4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-primary/12 text-primary flex items-center justify-center text-sm font-semibold">S</div>
                      <div>
                        <div className="h-2 w-20 bg-muted rounded" />
                        <div className="h-1.5 w-12 bg-muted/60 rounded mt-1" />
                      </div>
                    </div>
                    <div className="border-t border-border pt-2 space-y-1.5">
                      <div className="h-1.5 w-full bg-muted rounded" />
                      <div className="h-1.5 w-2/3 bg-muted rounded" />
                    </div>
                  </div>
                </div>
              }
            />
            <FeatureCard
              title="Any store, any item"
              description="Paste a link from anywhere — Amazon, Etsy, a local shop, or no link at all."
              visual={
                <div className="absolute inset-0 flex items-center justify-center px-4">
                  <div className="bg-card border border-border rounded-lg p-3 w-full shadow-sm space-y-2">
                    <div className="flex items-center gap-2 px-2 py-1.5 bg-muted/60 rounded">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <div className="h-1.5 flex-1 bg-foreground/30 rounded" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded bg-gradient-to-br from-rose-200 to-amber-200 shrink-0" />
                      <div className="flex-1 space-y-1">
                        <div className="h-2 w-3/4 bg-foreground/30 rounded" />
                        <div className="h-1.5 w-1/3 bg-muted rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              }
            />
            <FeatureCard
              title="No duplicate gifts"
              description="Gifters see what's already been claimed so everyone buys something different."
              visual={
                <div className="absolute inset-0 flex items-center justify-center gap-2 px-4">
                  <div className="bg-card border border-border rounded-lg p-2 w-1/2 shadow-sm relative">
                    <div className="aspect-square rounded bg-gradient-to-br from-emerald-100 to-emerald-200 mb-2 flex items-center justify-center">
                      <span className="text-lg">◐</span>
                    </div>
                    <div className="h-1.5 w-3/4 bg-foreground/30 rounded" />
                    <span className="absolute -top-1.5 -right-1.5 text-[8px] font-medium bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                      ✓
                    </span>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-2 w-1/2 shadow-sm">
                    <div className="aspect-square rounded bg-gradient-to-br from-blue-100 to-blue-200 mb-2 flex items-center justify-center">
                      <span className="text-lg">◇</span>
                    </div>
                    <div className="h-1.5 w-3/4 bg-foreground/30 rounded" />
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-background pb-20 px-6">
        <div className="max-w-2xl mx-auto bg-card border border-border rounded-2xl px-6 sm:px-10 py-10 sm:py-12 text-center">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">Start a list in under a minute.</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Free for everyone. Invite-only by design.
          </p>
          <Link
            href="/signup"
            className={buttonVariants({ size: 'lg', className: 'mt-6' })}
          >
            Create your wishlist
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-6 bg-background">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">Wishona</span>
          <p className="text-xs text-muted-foreground">Share what you want. Give what they&apos;ll love.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  title,
  description,
  visual,
}: {
  title: string
  description: string
  visual: React.ReactNode
}) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:border-foreground/20 hover:shadow-sm transition-all flex flex-col">
      <div className="aspect-[4/3] bg-gradient-to-br from-muted via-muted to-muted/50 relative">
        {visual}
      </div>
      <div className="p-5 space-y-1">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
