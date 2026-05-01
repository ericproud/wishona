'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signUp } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SignupForm({ redirectTo }: { redirectTo: string }) {
  const [error, formAction, pending] = useActionState(signUp, null)

  return (
    <div className="bg-card border border-border rounded-lg p-8 w-full max-w-sm shadow-sm">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">Create your account</h1>
        <p className="text-sm text-muted-foreground mt-1">Start sharing wishlists today</p>
      </div>
      <form action={formAction} className="space-y-4">
        {error && (
          <div className="bg-destructive/8 border border-destructive/20 text-destructive text-sm rounded-md px-3 py-2">
            {error}
          </div>
        )}
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <div className="space-y-1.5">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="jane-doe"
            required
            autoComplete="username"
          />
          <p className="text-xs text-muted-foreground">3–20 characters. Letters, numbers, and hyphens.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            minLength={6}
          />
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
      <p className="text-sm text-muted-foreground text-center mt-5">
        Already have an account?{' '}
        <Link
          href={redirectTo ? `/login?redirectTo=${encodeURIComponent(redirectTo)}` : '/login'}
          className="text-foreground font-medium hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  )
}
