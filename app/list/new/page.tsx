'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createList } from '@/lib/actions/lists'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function NewListPage() {
  const [state, formAction, pending] = useActionState(createList, null)
  const error = state && 'error' in state ? state.error : null

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-nav">
        <div className="max-w-[960px] mx-auto px-6 h-14 flex items-center">
          <Link href="/dashboard" className="text-white font-semibold text-sm tracking-tight hover:text-white/80 transition-colors">
            Gift Simple
          </Link>
        </div>
      </header>
      <main className="max-w-[960px] mx-auto px-6 py-8">
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <span className="text-border">›</span>
          <span className="text-foreground">New list</span>
        </div>

        <div className="max-w-md">
          <h1 className="text-xl font-semibold text-foreground mb-6">Create a new list</h1>
          <div className="bg-card border border-border rounded-lg p-6">
            <form action={formAction} className="space-y-4">
              {error && (
                <div className="bg-destructive/8 border border-destructive/20 text-destructive text-sm rounded-md px-3 py-2">
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="name">List name</Label>
                <Input id="name" name="name" placeholder="Birthday 2025" required autoFocus />
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={pending}>
                  {pending ? 'Creating…' : 'Create list'}
                </Button>
                <Link href="/dashboard" className={buttonVariants({ variant: 'ghost' })}>
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
