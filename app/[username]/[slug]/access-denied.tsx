import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default function AccessDenied({ ownerName }: { ownerName: string }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-nav">
        <div className="max-w-[960px] mx-auto px-6 h-14 flex items-center">
          <span className="text-white font-semibold text-sm tracking-tight">Gift Simple</span>
        </div>
      </header>
      <main className="max-w-[960px] mx-auto px-6 py-24 flex items-center justify-center">
        <div className="bg-card border border-border rounded-lg p-8 max-w-sm w-full text-center space-y-4">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-semibold text-foreground">Access restricted</h1>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
              This list is private. You need an invitation from {ownerName} to view it.
            </p>
          </div>
          <Link href="/dashboard" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            Go to dashboard
          </Link>
        </div>
      </main>
    </div>
  )
}
