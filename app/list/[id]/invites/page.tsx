import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { revokeInvite } from '@/lib/actions/invites'
import { PendingButton } from '@/components/ui/pending-button'
import AppShell from '@/components/app-shell'
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
      <div className="flex items-center gap-2 mb-6 text-sm">
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

      <div className="max-w-2xl space-y-6">
        <InviteForm listId={id} />

        {pending.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Pending ({pending.length})
            </h2>
            <div className="bg-card border border-border rounded-lg divide-y divide-border">
              {pending.map((invite: ListInvite) => (
                <div key={invite.id} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-foreground">{invite.invited_email}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Expires {new Date(invite.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                  <form action={revokeInvite.bind(null, invite.id)}>
                    <PendingButton variant="ghost" size="sm" pendingLabel="Revoking…" className="text-destructive hover:text-destructive">
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
            <div className="bg-card border border-border rounded-lg divide-y divide-border">
              {accepted.map((invite: ListInvite) => (
                <div key={invite.id} className="flex items-center px-5 py-3.5">
                  <p className="text-sm text-foreground">{invite.invited_email}</p>
                  <span className="ml-auto text-xs text-primary font-medium bg-primary/8 px-2 py-0.5 rounded-full">
                    Accepted
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {pending.length === 0 && accepted.length === 0 && (
          <div className="bg-card border border-border rounded-lg px-5 py-10 text-center">
            <p className="text-sm text-muted-foreground">No invites sent yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Add an email above to invite someone to this list.</p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
