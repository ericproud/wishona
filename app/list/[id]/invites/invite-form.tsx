'use client'

import { useActionState } from 'react'
import { sendInvite } from '@/lib/actions/invites'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function InviteForm({ listId }: { listId: string }) {
  const boundAction = sendInvite.bind(null, listId)
  const [state, formAction, pending] = useActionState(boundAction, null)

  const success = state && 'success' in state
  const inviteUrl = success && 'inviteUrl' in state ? state.inviteUrl : null
  const error = state && 'error' in state ? state.error : null

  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <h2 className="text-sm font-semibold text-foreground mb-3">Invite someone</h2>
      <form action={formAction} className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="email" className="sr-only">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="friend@example.com"
            required
            autoComplete="off"
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? 'Sending…' : 'Send invite'}
        </Button>
      </form>
      {error && (
        <p className="text-sm text-destructive mt-2">{error}</p>
      )}
      {success && !inviteUrl && (
        <p className="text-sm text-primary mt-2">Invite sent.</p>
      )}
      {inviteUrl && (
        <div className="mt-3 bg-muted rounded-md px-3 py-2.5 space-y-1">
          <p className="text-xs text-muted-foreground font-medium">Dev mode — copy this link to test:</p>
          <p className="text-xs break-all font-mono text-foreground">{inviteUrl}</p>
        </div>
      )}
    </div>
  )
}
