import Link from 'next/link'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { buttonVariants } from '@/components/ui/button'
import JoinButton from './join-button'

type LinkWithList = {
  id: string
  list_id: string
  is_active: boolean
  created_by: string
  list: {
    name: string
    slug: string
    owner_id: string
    owner: { first_name: string | null; last_name: string | null; username: string } | null
  } | null
}

export default async function JoinPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  const adminClient = createAdminClient()
  const { data: linkData } = await adminClient
    .from('list_invite_links')
    .select('id, list_id, is_active, created_by, list:lists(name, slug, owner_id, owner:users(first_name, last_name, username))')
    .eq('token', token)
    .maybeSingle()

  const link = linkData as LinkWithList | null

  if (!link) {
    return (
      <JoinShell
        title="Link not found"
        description="This invite link isn't valid. It may have been revoked or never existed."
      />
    )
  }

  if (!link.is_active) {
    return (
      <JoinShell
        title="Link deactivated"
        description="The owner has deactivated this invite link."
      />
    )
  }

  const list = link.list
  const owner = list?.owner
  const ownerName = (owner?.first_name && owner?.last_name)
    ? `${owner.first_name} ${owner.last_name}`
    : owner?.first_name ?? owner?.username ?? 'Someone'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const joinUrl = `/join/${token}`

  // Owner visiting their own link
  if (user?.id === list?.owner_id) {
    return (
      <JoinShell title="This is your list" description="You're the owner — you can't join your own list as a gifter.">
        <Link href="/dashboard" className={buttonVariants()}>Go to dashboard</Link>
      </JoinShell>
    )
  }

  // Already a member
  if (user) {
    const { data: existingInvite } = await adminClient
      .from('list_invites')
      .select('id')
      .eq('list_id', link.list_id)
      .eq('user_id', user.id)
      .not('accepted_at', 'is', null)
      .maybeSingle()

    if (existingInvite) {
      return (
        <JoinShell title="You're already a member" description={`You already have access to ${list?.name ?? 'this list'}.`}>
          <Link
            href={`/${owner?.username}/${list?.slug}`}
            className={buttonVariants()}
          >
            View list
          </Link>
        </JoinShell>
      )
    }
  }

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
              {ownerName} invited you to join their wishlist as a gifter.
            </p>
          </div>

          {user ? (
            <JoinButton token={token} />
          ) : (
            <div className="space-y-2.5">
              <Link
                href={`/signup?redirectTo=${encodeURIComponent(joinUrl)}`}
                className={buttonVariants({ className: 'w-full' })}
              >
                Create an account
              </Link>
              <Link
                href={`/login?redirectTo=${encodeURIComponent(joinUrl)}`}
                className={buttonVariants({ variant: 'outline', className: 'w-full' })}
              >
                Log in
              </Link>
              <p className="text-xs text-muted-foreground text-center pt-1">
                You need an account to join this list.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function JoinShell({
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
