import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { buttonVariants } from '@/components/ui/button'
import AppShell from '@/components/app-shell'
import ListsSection from './lists-section'
import type { List } from '@/types'

type GiftingList = {
  id: string
  list: {
    id: string
    name: string
    slug: string
    owner: { display_name: string | null; username: string }
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: listsData } = await supabase
    .from('lists')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  const lists = (listsData ?? []) as List[]
  const listIds = lists.map(l => l.id)

  const emptyRows = Promise.resolve({ data: [] as { list_id: string }[], error: null })
  const [{ data: itemRows }, { data: pendingRows }, { data: acceptedRows }, { data: giftingInvites }] = await Promise.all([
    listIds.length > 0
      ? supabase.from('items').select('list_id').in('list_id', listIds)
      : emptyRows,
    listIds.length > 0
      ? supabase.from('list_invites').select('list_id').in('list_id', listIds).is('accepted_at', null)
      : emptyRows,
    listIds.length > 0
      ? supabase.from('list_invites').select('list_id').in('list_id', listIds).not('accepted_at', 'is', null)
      : emptyRows,
    supabase
      .from('list_invites')
      .select('id, list:lists(id, name, slug, owner:users(display_name, username))')
      .eq('user_id', user.id)
      .not('accepted_at', 'is', null),
  ])

  const itemCounts: Record<string, number> = {}
  for (const row of (itemRows ?? [])) {
    itemCounts[row.list_id] = (itemCounts[row.list_id] ?? 0) + 1
  }
  const pendingInviteCounts: Record<string, number> = {}
  for (const row of (pendingRows ?? [])) {
    pendingInviteCounts[row.list_id] = (pendingInviteCounts[row.list_id] ?? 0) + 1
  }
  const acceptedInviteCounts: Record<string, number> = {}
  for (const row of (acceptedRows ?? [])) {
    acceptedInviteCounts[row.list_id] = (acceptedInviteCounts[row.list_id] ?? 0) + 1
  }

  const validGifting = (giftingInvites as unknown as GiftingList[]).filter(
    invite => invite.list !== null
  )

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your wishlists</p>
        </div>
        <Link href="/profile/edit" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          Edit profile
        </Link>
      </div>

      <div className="space-y-8">
        <ListsSection
          lists={lists}
          itemCounts={itemCounts}
          pendingInviteCounts={pendingInviteCounts}
          acceptedInviteCounts={acceptedInviteCounts}
        />

        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">Gifting on</h2>
          {validGifting.length === 0 ? (
            <div className="bg-card border border-border rounded-lg px-5 py-10 text-center">
              <p className="text-sm text-muted-foreground">You haven&apos;t accepted any invites yet.</p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg divide-y divide-border">
              {validGifting.map((invite) => {
                const owner = invite.list.owner
                const ownerName = owner.display_name ?? owner.username
                return (
                  <div key={invite.id} className="flex items-center justify-between px-5 py-3.5">
                    <div>
                      <p className="text-sm font-medium text-foreground">{invite.list.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{ownerName}&apos;s list</p>
                    </div>
                    <Link
                      href={`/${owner.username}/${invite.list.slug}`}
                      className={buttonVariants({ variant: 'outline', size: 'sm' })}
                    >
                      View list
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
