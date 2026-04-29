import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default function AccessDenied({ ownerName }: { ownerName: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-sm text-center space-y-4">
        <h1 className="text-xl font-semibold">Access restricted</h1>
        <p className="text-sm text-muted-foreground">
          This list is private. You need an invitation from {ownerName} to view it.
        </p>
        <Link href="/dashboard" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          Go to dashboard
        </Link>
      </div>
    </div>
  )
}
