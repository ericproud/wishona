'use client'

import { useActionState, useState } from 'react'
import { generateInviteLink, deactivateInviteLink } from '@/lib/actions/invite-links'
import { Button } from '@/components/ui/button'
import { PendingButton } from '@/components/ui/pending-button'
import { Link2 } from 'lucide-react'
import type { ListInviteLink } from '@/types'

interface InviteLinkSectionProps {
  listId: string
  inviteLink: ListInviteLink | null
}

export default function InviteLinkSection({ listId, inviteLink }: InviteLinkSectionProps) {
  const [confirmAction, setConfirmAction] = useState<'regenerate' | 'deactivate' | null>(null)
  const [copied, setCopied] = useState(false)

  const boundGenerate = generateInviteLink.bind(null, listId)
  const boundDeactivate = deactivateInviteLink.bind(null, listId)

  const [generateState, generateAction, generatePending] = useActionState(boundGenerate, null)
  const [deactivateState, deactivateAction, deactivatePending] = useActionState(boundDeactivate, null)

  // Derive current link from action results — no state sync needed
  const currentLink = (() => {
    if (generateState && 'link' in generateState) return generateState.link
    if (deactivateState && 'success' in deactivateState) return null
    return inviteLink
  })()

  // Hide confirm dialog once any action completes
  const actionJustCompleted =
    (generateState && 'link' in generateState && !generatePending) ||
    (deactivateState && 'success' in deactivateState && !deactivatePending)
  const effectiveConfirmAction = actionJustCompleted ? null : confirmAction

  const generateError = generateState && 'error' in generateState ? generateState.error : null
  const deactivateError = deactivateState && 'error' in deactivateState ? deactivateState.error : null

  // Read origin directly — '' during SSR, real value on client
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const joinUrl = currentLink?.is_active && origin ? `${origin}/join/${currentLink.token}` : null

  function handleCopy() {
    if (!joinUrl) return
    navigator.clipboard.writeText(joinUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="bg-card border border-border border-l-2 border-l-primary rounded-lg p-5 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
          <Link2 className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Share a link</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Anyone with this link can join as a gifter — no email needed.</p>
        </div>
      </div>

      {(generateError || deactivateError) && (
        <p className="text-sm text-destructive">{generateError ?? deactivateError}</p>
      )}

      {!currentLink ? (
        <form action={generateAction}>
          <PendingButton pendingLabel="Generating…" disabled={generatePending}>
            Generate invite link
          </PendingButton>
        </form>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {/* suppressHydrationWarning: origin is '' on SSR, real value on client */}
            <code suppressHydrationWarning className="flex-1 text-xs bg-muted px-3 py-2 rounded-md border border-border truncate text-muted-foreground">
              {joinUrl}
            </code>
            <Button variant="outline" size="sm" onClick={handleCopy} className="shrink-0">
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>

          {effectiveConfirmAction === null && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmAction('regenerate')}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Regenerate
              </button>
              <span className="text-xs text-border">·</span>
              <button
                type="button"
                onClick={() => setConfirmAction('deactivate')}
                className="text-xs text-destructive hover:text-destructive/80 transition-colors"
              >
                Deactivate
              </button>
            </div>
          )}

          {effectiveConfirmAction === 'regenerate' && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Regenerating will invalidate your current link. Anyone with the old link won&apos;t be able to use it.
              </p>
              <div className="flex gap-2">
                <form action={generateAction}>
                  <PendingButton size="sm" variant="outline" pendingLabel="Regenerating…" disabled={generatePending}>
                    Yes, regenerate
                  </PendingButton>
                </form>
                <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmAction(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {effectiveConfirmAction === 'deactivate' && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Deactivating will prevent anyone from using this link. You can generate a new one at any time.
              </p>
              <div className="flex gap-2">
                <form action={deactivateAction}>
                  <PendingButton
                    size="sm"
                    variant="outline"
                    pendingLabel="Deactivating…"
                    disabled={deactivatePending}
                    className="text-destructive hover:text-destructive"
                  >
                    Yes, deactivate
                  </PendingButton>
                </form>
                <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmAction(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
