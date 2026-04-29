import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight">The Art of Gifting</h1>
          <p className="text-muted-foreground text-lg">
            Share what you want. Give what they&apos;ll love.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Create a wishlist, invite the people in your life, and let them gift with confidence — no duplicates, no guessing.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/signup" className={buttonVariants({ size: 'lg' })}>
            Get started
          </Link>
          <Link href="/login" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
            Log in
          </Link>
        </div>
      </div>
    </main>
  )
}
