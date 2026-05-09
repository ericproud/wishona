'use client'

import { useActionState, useEffect, useRef } from 'react'
import { joinViaLinkForm } from '@/lib/actions/invite-links'
import { Button } from '@/components/ui/button'

interface JoinButtonProps {
  token: string
}

export default function JoinButton({ token }: JoinButtonProps) {
  const [state, formAction, pending] = useActionState(joinViaLinkForm, null)
  const formRef = useRef<HTMLFormElement>(null)

  // Auto-submit on mount — the user already expressed intent to join by
  // clicking the link and logging in / creating an account.
  useEffect(() => {
    formRef.current?.requestSubmit()
  }, [])

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <input type="hidden" name="token" value={token} />
      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Joining…' : 'Join list'}
      </Button>
    </form>
  )
}
