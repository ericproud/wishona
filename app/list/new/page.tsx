'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createList } from '@/lib/actions/lists'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function NewListPage() {
  const [state, formAction, pending] = useActionState(createList, null)
  const error = state && 'error' in state ? state.error : null

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="mb-8">
          <Link href="/dashboard" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
            ← Dashboard
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>New list</CardTitle>
          </CardHeader>
          <form action={formAction}>
            <CardContent className="space-y-4">
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="space-y-1.5">
                <Label htmlFor="name">List name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Birthday 2025"
                  required
                  autoFocus
                />
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button type="submit" disabled={pending}>
                {pending ? 'Creating…' : 'Create list'}
              </Button>
              <Link href="/dashboard" className={buttonVariants({ variant: 'ghost' })}>
                Cancel
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
