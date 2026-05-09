'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Resend } from 'resend'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { displayName, buildAllClaimedHtml } from '@/lib/email'

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

  await maybeNotifyOwnerAllClaimed(item.list_id)

  revalidatePath(listPath)
  return { success: true }
}

async function maybeNotifyOwnerAllClaimed(listId: string): Promise<void> {
  const admin = createAdminClient()

  const [{ data: listData }, { data: items }] = await Promise.all([
    admin
      .from('lists')
      .select('id, name, slug, all_claimed_notified_at, owner:users!lists_owner_id_fkey (email, first_name, last_name, username)')
      .eq('id', listId)
      .single(),
    admin
      .from('items')
      .select('id, quantity, purchases (quantity)')
      .eq('list_id', listId),
  ])

  if (!listData || !items || items.length === 0) return
  if (listData.all_claimed_notified_at) return

  const allClaimed = items.every((item) => {
    const claimed = (item.purchases as { quantity: number }[]).reduce((sum, p) => sum + (p.quantity ?? 1), 0)
    return claimed >= item.quantity
  })

  if (!allClaimed) return

  // Atomic update — only succeeds if the flag is still null, preventing duplicate sends
  const { data: updated } = await admin
    .from('lists')
    .update({ all_claimed_notified_at: new Date().toISOString() })
    .eq('id', listId)
    .is('all_claimed_notified_at', null)
    .select('id')

  if (!updated || updated.length === 0) return

  if (process.env.NODE_ENV !== 'production') return

  const owner = listData.owner as { email: string; first_name: string | null; last_name: string | null; username: string }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://wishona.com'
  const listUrl = `${appUrl}/${owner.username}/${listData.slug}`

  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: owner.email,
    subject: `Everything on your "${listData.name}" wishlist is claimed!`,
    html: buildAllClaimedHtml({
      ownerName: displayName(owner),
      listName: listData.name,
      listUrl,
      appUrl,
    }),
  })
}

export async function unmarkPurchased(purchaseId: string, listPath: string, listId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase
    .from('purchases')
    .delete()
    .eq('id', purchaseId)
    .eq('gifter_id', user.id)

  // Reset the flag so the owner is notified again if everything gets reclaimed
  createAdminClient()
    .from('lists')
    .update({ all_claimed_notified_at: null })
    .eq('id', listId)
    .then(() => { /* fire-and-forget */ })

  revalidatePath(listPath)
}
