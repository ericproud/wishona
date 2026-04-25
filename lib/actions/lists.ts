'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'
import type { SupabaseClient } from '@supabase/supabase-js'

export type ListState = { error: string } | { success: true } | null

async function uniqueSlug(
  supabase: SupabaseClient,
  ownerId: string,
  base: string,
  excludeId?: string
): Promise<string> {
  let slug = base
  let n = 2
  while (true) {
    let query = supabase
      .from('lists')
      .select('id')
      .eq('owner_id', ownerId)
      .eq('slug', slug)

    if (excludeId) query = query.neq('id', excludeId)

    const { data } = await query.maybeSingle()
    if (!data) return slug
    slug = `${base}-${n++}`
  }
}

export async function createList(
  _prevState: ListState,
  formData: FormData
): Promise<ListState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name = (formData.get('name') as string).trim()
  if (!name) return { error: 'List name is required.' }
  if (name.length > 100) return { error: 'List name must be 100 characters or fewer.' }

  const base = slugify(name)
  if (!base) return { error: 'List name must contain at least one letter or number.' }

  const slug = await uniqueSlug(supabase, user.id, base)

  // If the slug got a numeric suffix due to a name conflict, reflect that in the
  // display name so the user can tell their two "Birthday 2025" lists apart.
  let displayName = name
  if (slug !== base) {
    const match = slug.match(/-(\d+)$/)
    if (match) displayName = `${name} ${match[1]}`
  }

  const { error } = await supabase
    .from('lists')
    .insert({ owner_id: user.id, name: displayName, slug })

  if (error) return { error: error.message }

  redirect('/dashboard')
}

export async function updateList(listId: string, formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name = (formData.get('name') as string).trim()
  if (!name) return

  const base = slugify(name)
  if (!base) return

  const slug = await uniqueSlug(supabase, user.id, base, listId)

  await supabase
    .from('lists')
    .update({ name, slug })
    .eq('id', listId)
    .eq('owner_id', user.id)

  revalidatePath('/dashboard')
}

export async function deleteList(listId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase
    .from('lists')
    .delete()
    .eq('id', listId)
    .eq('owner_id', user.id)

  revalidatePath('/dashboard')
}
