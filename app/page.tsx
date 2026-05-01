import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="bg-nav">
        <div className="max-w-[960px] mx-auto px-6 h-14 flex items-center justify-between">
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
      <section className="bg-nav flex-1 flex items-center justify-center px-6 py-24">
        <div className="max-w-2xl text-center space-y-6">
          <h1 className="text-5xl font-semibold text-white tracking-tight leading-tight">
            Gifts they&apos;ll actually love.
          </h1>
          <p className="text-lg text-white/60 leading-relaxed max-w-lg mx-auto">
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

      {/* Features */}
      <section className="bg-background py-16 px-6">
        <div className="max-w-[960px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              title: 'Private by default',
              description: 'Your lists are invite-only. Share with exactly who you want, nothing more.',
            },
            {
              title: 'Any store, any item',
              description: 'Paste a link from anywhere — Amazon, Etsy, a local shop, or no link at all.',
            },
            {
              title: 'No duplicate gifts',
              description: "Gifters see what's already been claimed so everyone buys something different.",
            },
          ].map((f) => (
            <div key={f.title} className="bg-card border border-border rounded-lg p-6 space-y-2">
              <p className="font-semibold text-foreground">{f.title}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-6 bg-background">
        <div className="max-w-[960px] mx-auto flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">Wishona</span>
          <p className="text-xs text-muted-foreground">Share what you want. Give what they&apos;ll love.</p>
        </div>
      </footer>
    </div>
  )
}
