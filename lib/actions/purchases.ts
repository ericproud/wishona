'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type PurchaseState = { error: string } | { success: true } | null

export async function markPurchased(
  itemId: string,
  listPath: string,
  _prevState: PurchaseState,
  formData: FormData
): Promise<PurchaseState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: item } = await supabase
    .from('items')
    .select('id, quantity, list_id')
    .eq('id', itemId)
    .single()

  if (!item) return { error: 'Item not found.' }

  const { data: list } = await supabase
    .from('lists')
    .select('owner_id')
    .eq('id', item.list_id)
    .single()

  if (!list) return { error: 'List not found.' }
  if (list.owner_id === user.id) return { error: 'You cannot claim items on your own list.' }

  const { data: existing } = await supabase
    .from('purchases')
    .select('quantity')
    .eq('item_id', itemId)

  const totalClaimed = (existing ?? []).reduce((sum, p) => sum + (p.quantity ?? 1), 0)
  const available = item.quantity - totalClaimed

  if (available <= 0) return { error: 'This item is fully claimed.' }

  const quantityRaw = formData.get('quantity') as string
  const quantity = parseInt(quantityRaw, 10)

  if (isNaN(quantity) || quantity < 1) return { error: 'Quantity must be at least 1.' }
  if (quantity > available) return { error: `Only ${available} unit${available === 1 ? '' : 's'} remaining.` }

  const { error } = await supabase
    .from('purchases')
    .insert({ item_id: itemId, gifter_id: user.id, quantity })

  if (error) return { error: error.message }

  revalidatePath(listPath)
  return { success: true }
}

export async function unmarkPurchased(purchaseId: string, listPath: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase
    .from('purchases')
    .delete()
    .eq('id', purchaseId)
    .eq('gifter_id', user.id)

  revalidatePath(listPath)
}
