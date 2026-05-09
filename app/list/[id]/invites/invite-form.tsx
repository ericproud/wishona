'use client'

import { useActionState } from 'react'
import { sendInvite } from '@/lib/actions/invites'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail } from 'lucide-react'

export default function InviteForm({ listId }: { listId: string }) {
  const boundAction = sendInvite.bind(null, listId)
  const [state, formAction, pending] = useActionState(boundAction, null)

  const success = state && 'success' in state
  const inviteUrl = success && 'inviteUrl' in state ? state.inviteUrl : null
  const error = state && 'error' in state ? state.error : null

  return (
    <div className="bg-card border border-border rounded-lg p-5 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground shrink-0">
          <Mail className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Invite by email</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Send a personal invite to someone specific.</p>
        </div>
      </div>

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
        <p className="text-sm text-destructive -mt-2">{error}</p>
      )}
      {success && !inviteUrl && (
        <p className="text-sm text-primary -mt-2">Invite sent.</p>
      )}
      {inviteUrl && (
        <div className="bg-muted rounded-md px-3 py-2.5 space-y-1 -mt-2">
          <p className="text-xs text-muted-foreground font-medium">Dev mode — copy this link to test:</p>
          <p className="text-xs break-all font-mono text-foreground">{inviteUrl}</p>
        </div>
      )}
    </div>
  )
}
