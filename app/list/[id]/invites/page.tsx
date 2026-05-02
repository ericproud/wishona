import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { revokeInvite } from '@/lib/actions/invites'
import { PendingButton } from '@/components/ui/pending-button'
import AppShell from '@/components/app-shell'
import EmptyStateCard from '@/components/empty-state-card'
import InviteForm from './invite-form'
import type { List, ListInvite } from '@/types'

export default async function InvitesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: list } = await supabase
    .from('lists')
    .select('*')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (!list) redirect('/dashboard')

  const { data: invites } = await supabase
    .from('list_invites')
    .select('*')
    .eq('list_id', id)
    .order('created_at', { ascending: false })

  const pending = (invites ?? []).filter((i: ListInvite) => !i.accepted_at)
  const accepted = (invites ?? []).filter((i: ListInvite) => !!i.accepted_at)

  return (
    <AppShell>
      <div className="flex items-center gap-2 mb-6 text-sm flex-wrap">
        <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
          Dashboard
        </Link>
        <span className="text-border">›</span>
        <Link href={`/list/${id}/edit`} className="text-muted-foreground hover:text-foreground transition-colors">
          {(list as List).name}
        </Link>
        <span className="text-border">›</span>
        <span className="text-foreground">Invites</span>
      </div>

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">{(list as List).name}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage who has access to this list</p>
      </div>

      <div className="space-y-6">
        <InviteForm listId={id} />

        {pending.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Pending ({pending.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pending.map((invite: ListInvite) => (
                <div
                  key={invite.id}
                  className="bg-card border border-border rounded-lg px-4 py-3 flex items-center gap-3"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{invite.invited_email}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Expires {new Date(invite.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                  <form action={revokeInvite.bind(null, invite.id)}>
                    <PendingButton
                      variant="ghost"
                      size="sm"
                      pendingLabel="Revoking…"
                      className="text-destructive hover:text-destructive"
                    >
                      Revoke
                    </PendingButton>
                  </form>
                </div>
              ))}
            </div>
          </div>
        )}

        {accepted.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Accepted ({accepted.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {accepted.map((invite: ListInvite) => (
                <div
                  key={invite.id}
                  className="bg-card border border-border rounded-lg px-4 py-3 flex items-center gap-3"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{invite.invited_email}</p>
                    <p className="text-xs text-primary/80 mt-0.5">Accepted</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {pending.length === 0 && accepted.length === 0 && (
          <EmptyStateCard
            title="No invites sent yet."
            description="Add an email above to invite someone to this list."
          />
        )}
      </div>
    </AppShell>
  )
}
