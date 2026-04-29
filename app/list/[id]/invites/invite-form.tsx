'use client'

import { useActionState } from 'react'
import { sendInvite } from '@/lib/actions/invites'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function InviteForm({ listId }: { listId: string }) {
  const boundAction = sendInvite.bind(null, listId)
  const [state, formAction, pending] = useActionState(boundAction, null)

  const success = state && 'success' in state
  const inviteUrl = success && 'inviteUrl' in state ? state.inviteUrl : null
  const error = state && 'error' in state ? state.error : null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Invite someone</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
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
        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && !inviteUrl && <p className="text-sm text-green-600">Invite sent.</p>}
        {inviteUrl && (
          <div className="rounded-md bg-muted px-3 py-2 space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Dev mode — copy this link to test:</p>
            <p className="text-xs break-all font-mono">{inviteUrl}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
