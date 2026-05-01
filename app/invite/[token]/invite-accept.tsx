'use client'

import { useActionState } from 'react'
import { acceptInviteForm } from '@/lib/actions/invites'
import { Button } from '@/components/ui/button'

interface InviteAcceptProps {
  token: string
  userEmail: string
  invitedEmail: string
}

export default function InviteAccept({ token, userEmail, invitedEmail }: InviteAcceptProps) {
  const [state, formAction, pending] = useActionState(acceptInviteForm, null)
  const error = state?.error ?? null

  if (userEmail.toLowerCase() !== invitedEmail.toLowerCase()) {
    return (
      <div className="bg-destructive/8 border border-destructive/20 rounded-md px-3 py-2.5 text-sm text-destructive">
        This invite was sent to <strong>{invitedEmail}</strong>. You&apos;re signed in as <strong>{userEmail}</strong>. Please log in with the correct account.
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="token" value={token} />
      {error && (
        <div className="bg-destructive/8 border border-destructive/20 text-destructive text-sm rounded-md px-3 py-2">
          {error}
        </div>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Accepting…' : 'Accept invite'}
      </Button>
    </form>
  )
}
