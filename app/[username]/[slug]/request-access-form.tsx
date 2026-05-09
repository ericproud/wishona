'use client'

import { useActionState } from 'react'
import { requestAccess } from '@/lib/actions/invites'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function RequestAccessForm({
  ownerUserId,
  ownerName,
}: {
  ownerUserId: string
  ownerName: string
}) {
  const [state, action, pending] = useActionState(requestAccess, null)

  if (state && 'success' in state) {
    return (
      <div className="text-center space-y-1 pt-1">
        <p className="text-sm font-medium text-foreground">Request sent</p>
        <p className="text-sm text-muted-foreground">{ownerName} will be notified by email.</p>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-3 w-full">
      <input type="hidden" name="ownerUserId" value={ownerUserId} />
      <input type="hidden" name="ownerName" value={ownerName} />
      <div className="space-y-1.5">
        <Label htmlFor="req-email" className="text-sm">Your email</Label>
        <Input
          id="req-email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          className="text-sm"
        />
      </div>
      {state && 'error' in state && (
        <p className="text-xs text-destructive">{state.error}</p>
      )}
      <Button type="submit" size="sm" className="w-full" disabled={pending}>
        {pending ? 'Sending…' : 'Request access'}
      </Button>
    </form>
  )
}
