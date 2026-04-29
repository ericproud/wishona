import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/lib/actions/auth'
import { Button, buttonVariants } from '@/components/ui/button'
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

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">{(list as List).name}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {(items ?? []).length === 0
                ? 'No items yet'
                : `${(items ?? []).length} item${(items ?? []).length === 1 ? '' : 's'}`}
            </p>
          </div>
          <ItemForm listId={id} />
        </div>

        <ItemList items={(items ?? []) as Item[]} />
      </div>
    </div>
  )
}
