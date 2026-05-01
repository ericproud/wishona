'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(signIn, null)

  useEffect(() => {
    if (state && 'redirectTo' in state) {
      router.push(state.redirectTo)
    }
  }, [state, router])

  const error = state && 'error' in state ? state.error : null

  return (
    <div className="bg-card border border-border rounded-lg p-8 w-full max-w-sm shadow-sm">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">Welcome back</h1>
        <p className="text-sm text-muted-foreground mt-1">Log in to your account</p>
      </div>
      <form action={formAction} className="space-y-4">
        {error && (
          <div className="bg-destructive/8 border border-destructive/20 text-destructive text-sm rounded-md px-3 py-2">
            {error}
          </div>
        )}
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required autoComplete="current-password" />
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? 'Logging in…' : 'Log in'}
        </Button>
      </form>
      <p className="text-sm text-muted-foreground text-center mt-5">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-foreground font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}
