import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/app-shell'
import ItemForm from './item-form'
import ItemList from './item-list'
import type { Item, List } from '@/types'

export default async function EditItemsPage({
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

  const { data: items } = await supabase
    .from('items')
    .select('*')
    .eq('list_id', id)
    .order('created_at', { ascending: true })

  const itemList = (items ?? []) as Item[]

  return (
    <AppShell>
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
          Dashboard
        </Link>
        <span className="text-border">›</span>
        <span className="text-foreground">{(list as List).name}</span>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{(list as List).name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {itemList.length === 0
              ? 'No items yet'
              : `${itemList.length} ${itemList.length === 1 ? 'item' : 'items'}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/list/${id}/invites`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Manage invites
          </Link>
          <ItemForm listId={id} />
        </div>
      </div>

      {itemList.length === 0 ? (
        <div className="bg-card border border-border rounded-lg px-5 py-12 text-center">
          <p className="text-sm text-muted-foreground">No items on this list yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Click &ldquo;Add item&rdquo; to get started.</p>
        </div>
      ) : (
        <ItemList items={itemList} />
      )}
    </AppShell>
  )
}
