import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/lib/actions/auth'
import { Button, buttonVariants } from '@/components/ui/button'
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

  if (!user) {
    redirect('/login')
  }

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

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto space-y-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="flex items-center gap-2">
            <Link href="/profile/edit" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              Edit profile
            </Link>
            <form action={signOut}>
              <Button variant="outline" size="sm" type="submit">Log out</Button>
            </form>
          </div>
        </div>

        <ListsSection lists={lists} itemCounts={itemCounts} pendingInviteCounts={pendingInviteCounts} acceptedInviteCounts={acceptedInviteCounts} />

        {/* Lists the user is gifting on */}
        {(() => {
          const validGifting = (giftingInvites as unknown as GiftingList[]).filter(
            invite => invite.list !== null
          )
          return (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Gifting on</h2>
              {validGifting.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  You haven&apos;t accepted any invites yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {validGifting.map((invite) => {
                    const owner = invite.list.owner
                    const ownerName = owner.display_name ?? owner.username
                    return (
                      <li key={invite.id} className="border border-border rounded-lg px-4 py-3 bg-card">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{invite.list.name}</p>
                            <p className="text-xs text-muted-foreground">{ownerName}&apos;s list</p>
                          </div>
                          <Link
                            href={`/${owner.username}/${invite.list.slug}`}
                            className={buttonVariants({ variant: 'outline', size: 'sm' })}
                          >
                            View list
                          </Link>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })()}
      </div>
    </main>
  )
}
