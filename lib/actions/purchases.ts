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

  const isAnonymous = formData.get('is_anonymous') === 'true'

  const { error } = await supabase
    .from('purchases')
    .insert({ item_id: itemId, gifter_id: user.id, quantity, is_anonymous: isAnonymous })

  if (error) return { error: error.message }

  await maybeNotifyGiftersAllClaimed(item.list_id)

  revalidatePath(listPath)
  return { success: true }
}

async function maybeNotifyGiftersAllClaimed(listId: string): Promise<void> {
  const admin = createAdminClient()

  const [{ data: listData }, { data: items }] = await Promise.all([
    admin
      .from('lists')
      .select(`
        id, name, slug, all_claimed_notified_at,
        owner:users!lists_owner_id_fkey (first_name, last_name, username),
        list_invites (
          invited_email, user_id, accepted_at,
          gifter:users!list_invites_user_id_fkey (email, first_name)
        )
      `)
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

  const owner = listData.owner as { first_name: string | null; last_name: string | null; username: string }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://wishona.com'
  const listUrl = `${appUrl}/${owner.username}/${listData.slug}`
  const ownerName = displayName(owner)

  const invites = listData.list_invites as {
    invited_email: string
    user_id: string | null
    accepted_at: string | null
    gifter: { email: string; first_name: string | null } | null
  }[]

  const accepted = invites.filter((inv) => inv.user_id !== null && inv.accepted_at !== null)

  const resend = new Resend(process.env.RESEND_API_KEY)

  for (const invite of accepted) {
    const toEmail = invite.gifter?.email ?? invite.invited_email
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: toEmail,
      subject: `${ownerName}'s ${listData.name} is all covered`,
      html: buildAllClaimedHtml({
        ownerName,
        listName: listData.name,
        listUrl,
        appUrl,
      }),
    })
  }
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
