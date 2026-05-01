import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import AppShell from '@/components/app-shell'
import AdminUsers from './admin-users'
import AdminLists from './admin-lists'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.id !== process.env.ADMIN_USER_ID) {
    redirect('/dashboard')
  }

  const adminClient = createAdminClient()

  const [
    { data: usersData },
    { data: listsData },
    { data: authUsers },
  ] = await Promise.all([
    adminClient.from('users').select('id, username, display_name, created_at').order('created_at', { ascending: false }),
    adminClient.from('lists').select('id, name, slug, owner_id, created_at').order('created_at', { ascending: false }),
    adminClient.auth.admin.listUsers({ perPage: 1000 }),
  ])

  const users = usersData ?? []
  const lists = listsData ?? []
  const authUserMap = Object.fromEntries(
    (authUsers?.users ?? []).map(u => [u.id, u.email ?? ''])
  )

  const listIds = lists.map(l => l.id)
  const { data: itemRows } = listIds.length > 0
    ? await adminClient.from('items').select('list_id').in('list_id', listIds)
    : { data: [] as { list_id: string }[] }

  const itemCounts: Record<string, number> = {}
  for (const row of (itemRows ?? [])) {
    itemCounts[row.list_id] = (itemCounts[row.list_id] ?? 0) + 1
  }

  const listCountsByUser: Record<string, number> = {}
  for (const list of lists) {
    listCountsByUser[list.owner_id] = (listCountsByUser[list.owner_id] ?? 0) + 1
  }

  const userMap = Object.fromEntries(users.map(u => [u.id, u]))

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-foreground">Admin</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {users.length} users · {lists.length} lists
        </p>
      </div>

      <div className="space-y-8">
        <AdminUsers
          users={users.map(u => ({
            id: u.id,
            username: u.username,
            display_name: u.display_name,
            email: authUserMap[u.id] ?? '',
            created_at: u.created_at,
            list_count: listCountsByUser[u.id] ?? 0,
          }))}
        />

        <AdminLists
          lists={lists.map(l => ({
            id: l.id,
            name: l.name,
            slug: l.slug,
            owner_id: l.owner_id,
            owner_username: userMap[l.owner_id]?.username ?? '',
            created_at: l.created_at,
            item_count: itemCounts[l.id] ?? 0,
          }))}
        />
      </div>
    </AppShell>
  )
}
