'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getStorageItemPath } from '@/lib/utils'

export type ItemState = { error: string } | { success: true } | null

export async function addItem(
  listId: string,
  _prevState: ItemState,
  formData: FormData
): Promise<ItemState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: list } = await supabase
    .from('lists')
    .select('id')
    .eq('id', listId)
    .eq('owner_id', user.id)
    .single()

  if (!list) return { error: 'List not found.' }

  const name = (formData.get('name') as string).trim()
  if (!name) return { error: 'Item name is required.' }

  const urlRaw = (formData.get('url') as string).trim()
  const priceRaw = (formData.get('price') as string).trim()
  const quantityRaw = (formData.get('quantity') as string).trim()
  const notes = (formData.get('notes') as string).trim()
  const imageUrl = (formData.get('image_url') as string | null)?.trim() || null

  const url = urlRaw || null
  const price = priceRaw ? parseFloat(priceRaw) : null
  const quantity = quantityRaw ? parseInt(quantityRaw, 10) : 1
  const priorityRaw = (formData.get('priority') as string).trim()
  const priority = priorityRaw ? parseInt(priorityRaw, 10) : null

  if (price !== null && (isNaN(price) || price < 0)) return { error: 'Price must be a positive number.' }
  if (isNaN(quantity) || quantity < 1) return { error: 'Quantity must be at least 1.' }
  if (priority !== null && ![1, 2, 3].includes(priority)) return { error: 'Invalid priority.' }

  const { error } = await supabase
    .from('items')
    .insert({ list_id: listId, name, url, price, quantity, notes: notes || null, image_url: imageUrl, priority })

  if (error) return { error: error.message }

  revalidatePath(`/list/${listId}/edit`)
  return { success: true }
}

export async function updateItem(
  itemId: string,
  _prevState: ItemState,
  formData: FormData
): Promise<ItemState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: item } = await supabase
    .from('items')
    .select('list_id, image_url, lists!inner(owner_id)')
    .eq('id', itemId)
    .single()

  if (!item) return { error: 'Item not found.' }

  const name = (formData.get('name') as string).trim()
  if (!name) return { error: 'Item name is required.' }

  const urlRaw = (formData.get('url') as string).trim()
  const priceRaw = (formData.get('price') as string).trim()
  const quantityRaw = (formData.get('quantity') as string).trim()
  const notes = (formData.get('notes') as string).trim()
  const imageUrl = (formData.get('image_url') as string | null)?.trim() || null

  const url = urlRaw || null
  const price = priceRaw ? parseFloat(priceRaw) : null
  const quantity = quantityRaw ? parseInt(quantityRaw, 10) : 1
  const priorityRaw = (formData.get('priority') as string).trim()
  const priority = priorityRaw ? parseInt(priorityRaw, 10) : null

  if (price !== null && (isNaN(price) || price < 0)) return { error: 'Price must be a positive number.' }
  if (isNaN(quantity) || quantity < 1) return { error: 'Quantity must be at least 1.' }
  if (priority !== null && ![1, 2, 3].includes(priority)) return { error: 'Invalid priority.' }

  const { error } = await supabase
    .from('items')
    .update({ name, url, price, quantity, notes: notes || null, image_url: imageUrl, priority })
    .eq('id', itemId)

  if (error) return { error: error.message }

  if (item.image_url && item.image_url !== imageUrl) {
    const oldPath = getStorageItemPath(item.image_url)
    if (oldPath) await supabase.storage.from('avatars').remove([oldPath])
  }

  revalidatePath(`/list/${item.list_id}/edit`)
  return { success: true }
}

export async function deleteItem(itemId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: item } = await supabase
    .from('items')
    .select('list_id, image_url')
    .eq('id', itemId)
    .single()

  if (!item) return

  await supabase
    .from('items')
    .delete()
    .eq('id', itemId)

  if (item.image_url) {
    const path = getStorageItemPath(item.image_url)
    if (path) await supabase.storage.from('avatars').remove([path])
  }

  revalidatePath(`/list/${item.list_id}/edit`)
}
