import Link from 'next/link'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import InviteAccept from './invite-accept'

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  const adminClient = await createAdminClient()
  const { data: invite } = await adminClient
    .from('list_invites')
    .select('id, invited_email, accepted_at, expires_at, list_id')
    .eq('token', token)
    .maybeSingle()

  // Token not found
  if (!invite) {
    return <InviteShell title="Invite not found" description="This invite link is not valid. It may have been revoked or never existed." />
  }

  // Token expired
  if (new Date(invite.expires_at) < new Date()) {
    return <InviteShell title="Invite expired" description="This invite link has expired. Ask the list owner to send a new one." />
  }

  // Already accepted
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
        .select('display_name, username')
        .eq('id', list.owner_id)
        .single()
    : { data: null }

  const ownerName = owner?.display_name ?? owner?.username ?? 'Someone'

  // Check if the current user is logged in
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const inviteUrl = `/invite/${token}`

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>You&apos;re invited</CardTitle>
          <CardDescription>
            <strong>{ownerName}</strong> has invited you to their wishlist: <strong>{list?.name ?? 'their wishlist'}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user ? (
            <InviteAccept token={token} userEmail={user.email ?? ''} invitedEmail={invite.invited_email} />
          ) : (
            <div className="flex flex-col gap-3">
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
            </div>
          )}
        </CardContent>
      </Card>
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
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        {children && <CardContent>{children}</CardContent>}
      </Card>
    </div>
  )
}
