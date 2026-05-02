import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { buttonVariants } from '@/components/ui/button'
import AppShell from '@/components/app-shell'
import EmptyStateCard from '@/components/empty-state-card'
import ListCard from '@/components/list-card'
import ListsSection from './lists-section'
import type { List } from '@/types'

type GiftingList = {
  id: string
  list: {
    id: string
    name: string
    slug: string
    owner: { first_name: string | null; last_name: string | null; username: string }
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

  const emptyItemRows = Promise.resolve({ data: [] as { list_id: string; image_url: string | null; created_at: string | null }[], error: null })
  const emptyInviteRows = Promise.resolve({ data: [] as { list_id: string }[], error: null })
  const [{ data: itemRows }, { data: pendingRows }, { data: acceptedRows }, { data: giftingInvites }] = await Promise.all([
    listIds.length > 0
      ? supabase.from('items').select('list_id, image_url, created_at').in('list_id', listIds).order('created_at', { ascending: true })
      : emptyItemRows,
    listIds.length > 0
      ? supabase.from('list_invites').select('list_id').in('list_id', listIds).is('accepted_at', null)
      : emptyInviteRows,
    listIds.length > 0
      ? supabase.from('list_invites').select('list_id').in('list_id', listIds).not('accepted_at', 'is', null)
      : emptyInviteRows,
    supabase
      .from('list_invites')
      .select('id, list:lists(id, name, slug, owner:users(first_name, last_name, username))')
      .eq('user_id', user.id)
      .not('accepted_at', 'is', null),
  ])

  const itemCounts: Record<string, number> = {}
  const coverImagesByList: Record<string, string[]> = {}
  for (const row of (itemRows ?? [])) {
    itemCounts[row.list_id] = (itemCounts[row.list_id] ?? 0) + 1
    if (row.image_url) {
      const list = coverImagesByList[row.list_id] ?? (coverImagesByList[row.list_id] = [])
      if (list.length < 4) list.push(row.image_url)
    }
  }
  const pendingInviteCounts: Record<string, number> = {}
  for (const row of (pendingRows ?? [])) {
    pendingInviteCounts[row.list_id] = (pendingInviteCounts[row.list_id] ?? 0) + 1
  }
  const acceptedInviteCounts: Record<string, number> = {}
  for (const row of (acceptedRows ?? [])) {
    acceptedInviteCounts[row.list_id] = (acceptedInviteCounts[row.list_id] ?? 0) + 1
  }

  const validGifting = (giftingInvites as unknown as GiftingList[]).filter(invite => invite.list !== null)
  const giftingListIds = validGifting.map(g => g.list.id)
  const giftingCovers: Record<string, string[]> = {}
  const giftingCounts: Record<string, number> = {}
  if (giftingListIds.length > 0) {
    const { data: giftingItems } = await supabase
      .from('items')
      .select('list_id, image_url, created_at')
      .in('list_id', giftingListIds)
      .order('created_at', { ascending: true })
    for (const row of (giftingItems ?? [])) {
      giftingCounts[row.list_id] = (giftingCounts[row.list_id] ?? 0) + 1
      if (row.image_url) {
        const list = giftingCovers[row.list_id] ?? (giftingCovers[row.list_id] = [])
        if (list.length < 4) list.push(row.image_url)
      }
    }
  }

  return (
    <AppShell>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your wishlists</p>
        </div>
        <Link href="/profile/edit" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          Edit profile
        </Link>
      </div>

      <div className="space-y-10">
        <ListsSection
          lists={lists}
          itemCounts={itemCounts}
          coverImagesByList={coverImagesByList}
          pendingInviteCounts={pendingInviteCounts}
          acceptedInviteCounts={acceptedInviteCounts}
        />

        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">Gifting on</h2>
          {validGifting.length === 0 ? (
            <EmptyStateCard
              title="You haven't accepted any invites yet."
              description="When someone invites you to their wishlist, it'll show up here."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {validGifting.map((invite) => {
                const owner = invite.list.owner
                const ownerName = (owner.first_name && owner.last_name) ? `${owner.first_name} ${owner.last_name}` : owner.first_name || owner.username
                const count = giftingCounts[invite.list.id] ?? 0
                return (
                  <ListCard
                    key={invite.id}
                    href={`/${owner.username}/${invite.list.slug}`}
                    name={invite.list.name}
                    coverImages={giftingCovers[invite.list.id] ?? []}
                    metadata={
                      <>
                        <span>{ownerName}&apos;s list</span>
                        <span className="mx-1.5 text-border">·</span>
                        <span>{count} {count === 1 ? 'item' : 'items'}</span>
                      </>
                    }
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
