import Link from 'next/link'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { buttonVariants } from '@/components/ui/button'
import InviteAccept from './invite-accept'

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  const adminClient = createAdminClient()
  const { data: invite } = await adminClient
    .from('list_invites')
    .select('id, invited_email, accepted_at, expires_at, list_id')
    .eq('token', token)
    .maybeSingle()

  if (!invite) {
    return (
      <InviteShell
        title="Invite not found"
        description="This invite link isn't valid. It may have been revoked or never existed."
      />
    )
  }

  if (new Date(invite.expires_at) < new Date()) {
    return (
      <InviteShell
        title="Invite expired"
        description="This invite link has expired. Ask the list owner to send a new one."
      />
    )
  }

  if (invite.accepted_at) {
    return (
      <InviteShell title="Already accepted" description="This invite has already been accepted.">
        <Link href="/dashboard" className={buttonVariants()}>Go to dashboard</Link>
      </InviteShell>
    )
  }

  const { data: list } = await adminClient
    .from('lists')
    .select('name, owner_id')
    .eq('id', invite.list_id)
    .single()

  const { data: owner } = list
    ? await adminClient
        .from('users')
        .select('first_name, last_name, username')
        .eq('id', list.owner_id)
        .single()
    : { data: null }

  const ownerName = (owner?.first_name && owner?.last_name)
    ? `${owner.first_name} ${owner.last_name}`
    : owner?.first_name ?? owner?.username ?? 'Someone'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const inviteUrl = `/invite/${token}`

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-nav">
        <div className="max-w-[960px] mx-auto px-6 h-14 flex items-center">
          <span className="text-white font-semibold text-sm tracking-tight">Wishona</span>
        </div>
      </header>
      <main className="flex items-center justify-center px-4 py-16">
        <div className="bg-card border border-border rounded-lg p-8 w-full max-w-sm shadow-sm">
          <div className="mb-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2">
              You&apos;re invited
            </p>
            <h1 className="text-xl font-semibold text-foreground">
              {list?.name ?? 'A wishlist'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {ownerName} has invited you to view their wishlist.
            </p>
          </div>

          {user ? (
            <InviteAccept token={token} userEmail={user.email ?? ''} invitedEmail={invite.invited_email} />
          ) : (
            <div className="space-y-2.5">
              <Link
                href={`/signup?redirectTo=${encodeURIComponent(inviteUrl)}`}
                className={buttonVariants({ className: 'w-full' })}
              >
                Create an account
              </Link>
              <Link
                href={`/login?redirectTo=${encodeURIComponent(inviteUrl)}`}
                className={buttonVariants({ variant: 'outline', className: 'w-full' })}
              >
                Log in
              </Link>
              <p className="text-xs text-muted-foreground text-center pt-1">
                You need an account to accept this invite.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function InviteShell({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children?: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-nav">
        <div className="max-w-[960px] mx-auto px-6 h-14 flex items-center">
          <span className="text-white font-semibold text-sm tracking-tight">Wishona</span>
        </div>
      </header>
      <main className="flex items-center justify-center px-4 py-16">
        <div className="bg-card border border-border rounded-lg p-8 w-full max-w-sm shadow-sm text-center space-y-3">
          <h1 className="text-base font-semibold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
          {children && <div className="pt-2">{children}</div>}
        </div>
      </main>
    </div>
  )
}
