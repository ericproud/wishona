'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { ListInviteLink } from '@/types'

export type InviteLinkState = { error: string } | { link: ListInviteLink } | null

type LinkWithList = {
  id: string
  list_id: string
  is_active: boolean
  created_by: string
  list: {
    slug: string
    owner_id: string
    owner: { username: string } | null
  } | null
}

export async function generateInviteLink(
  listId: string,
  _prevState: InviteLinkState,
  _formData: FormData
): Promise<InviteLinkState> {
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

  const newToken = crypto.randomUUID()

  const { data: existing } = await supabase
    .from('list_invite_links')
    .select('id')
    .eq('list_id', listId)
    .maybeSingle()

  let link, linkError

  if (existing) {
    const { data, error } = await supabase
      .from('list_invite_links')
      .update({ token: newToken, is_active: true })
      .eq('id', existing.id)
      .select()
      .single()
    link = data
    linkError = error
  } else {
    const { data, error } = await supabase
      .from('list_invite_links')
      .insert({ list_id: listId, created_by: user.id, token: newToken, is_active: true })
      .select()
      .single()
    link = data
    linkError = error
  }

  if (linkError) return { error: linkError.message }
  if (!link) return { error: 'Failed to generate invite link.' }

  revalidatePath(`/list/${listId}/invites`)
  return { link }
}

export async function deactivateInviteLink(
  listId: string,
  _prevState: { error: string } | { success: true } | null,
  _formData: FormData
): Promise<{ error: string } | { success: true }> {
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

  const { error } = await supabase
    .from('list_invite_links')
    .update({ is_active: false })
    .eq('list_id', listId)

  if (error) return { error: error.message }

  revalidatePath(`/list/${listId}/invites`)
  return { success: true }
}

export async function joinViaLink(
  token: string
): Promise<{ error: string } | { username: string; slug: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be logged in to join.' }

  const adminClient = createAdminClient()

  const { data: linkData } = await adminClient
    .from('list_invite_links')
    .select('id, list_id, is_active, created_by, list:lists(slug, owner_id, owner:users(username))')
    .eq('token', token)
    .maybeSingle()

  const link = linkData as LinkWithList | null

  if (!link) return { error: 'This invite link is not valid.' }
  if (!link.is_active) return { error: 'This invite link has been deactivated.' }
  if (link.created_by === user.id) return { error: 'You cannot join your own list.' }

  const email = user.email!.toLowerCase()
  const listId = link.list_id

  const { data: existing } = await adminClient
    .from('list_invites')
    .select('id, accepted_at')
    .eq('list_id', listId)
    .eq('invited_email', email)
    .maybeSingle()

  if (existing?.accepted_at) {
    // Already a member — just redirect them
  } else if (existing && !existing.accepted_at) {
    // Pending email invite — accept it
    const { error } = await adminClient
      .from('list_invites')
      .update({ user_id: user.id, accepted_at: new Date().toISOString() })
      .eq('id', existing.id)

    if (error) return { error: error.message }
  } else {
    // No existing invite — create one
    const { error } = await adminClient
      .from('list_invites')
      .insert({
        list_id: listId,
        invited_by: link.created_by,
        invited_email: email,
        token: crypto.randomUUID(),
        user_id: user.id,
        accepted_at: new Date().toISOString(),
        expires_at: '2099-12-31T00:00:00.000Z',
      })

    if (error) {
      // Race condition: unique constraint — treat as already joined
      if (error.code !== '23505') return { error: error.message }
    }
  }

  revalidatePath('/dashboard')
  revalidatePath(`/list/${listId}/invites`)

  return {
    username: link.list?.owner?.username ?? '',
    slug: link.list?.slug ?? '',
  }
}

export async function joinViaLinkForm(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const token = formData.get('token') as string
  const result = await joinViaLink(token)
  if ('error' in result) return result
  redirect(`/${result.username}/${result.slug}`)
}
