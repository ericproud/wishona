import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/lib/actions/auth'
import { revokeInvite } from '@/lib/actions/invites'
import { Button, buttonVariants } from '@/components/ui/button'
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
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
            ← Dashboard
          </Link>
          <form action={signOut}>
            <Button variant="outline" size="sm" type="submit">Log out</Button>
          </form>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold">{(list as List).name}</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage who has access to this list</p>
        </div>

        <InviteForm listId={id} />

        {pending.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Pending ({pending.length})
            </h2>
            <ul className="space-y-2">
              {pending.map((invite: ListInvite) => (
                <li key={invite.id} className="flex items-center justify-between border border-border rounded-lg px-4 py-3 bg-card">
                  <div>
                    <p className="text-sm font-medium">{invite.invited_email}</p>
                    <p className="text-xs text-muted-foreground">
                      Expires {new Date(invite.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                  <form action={revokeInvite.bind(null, invite.id)}>
                    <Button variant="ghost" size="sm" type="submit">Revoke</Button>
                  </form>
                </li>
              ))}
            </ul>
          </div>
        )}

        {accepted.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Accepted ({accepted.length})
            </h2>
            <ul className="space-y-2">
              {accepted.map((invite: ListInvite) => (
                <li key={invite.id} className="flex items-center border border-border rounded-lg px-4 py-3 bg-card">
                  <p className="text-sm font-medium">{invite.invited_email}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {pending.length === 0 && accepted.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No invites sent yet.
          </p>
        )}
      </div>
    </div>
  )
}
