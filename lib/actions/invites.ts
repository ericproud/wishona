'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Resend } from 'resend'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export type InviteState = { error: string } | { success: true; inviteUrl?: string } | null

export async function sendInvite(
  listId: string,
  _prevState: InviteState,
  formData: FormData
): Promise<InviteState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const email = (formData.get('email') as string).trim().toLowerCase()
  if (!email) return { error: 'Email is required.' }

  // Verify the list belongs to this user
  const { data: list } = await supabase
    .from('lists')
    .select('id, name, owner_id')
    .eq('id', listId)
    .eq('owner_id', user.id)
    .single()

  if (!list) return { error: 'List not found.' }

  // Prevent owners from inviting themselves
  const { data: ownerUser } = await supabase
    .from('users')
    .select('email, display_name, username')
    .eq('id', user.id)
    .single()

  if (ownerUser?.email === email) {
    return { error: 'You cannot invite yourself.' }
  }

  // Check for an existing active invite for this email on this list
  const { data: existing } = await supabase
    .from('list_invites')
    .select('id, accepted_at')
    .eq('list_id', listId)
    .eq('invited_email', email)
    .maybeSingle()

  if (existing) {
    if (existing.accepted_at) return { error: 'This person has already accepted an invite to this list.' }
    return { error: 'An invite has already been sent to this email.' }
  }

  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const { error: insertError } = await supabase
    .from('list_invites')
    .insert({
      list_id: listId,
      invited_by: user.id,
      invited_email: email,
      token,
      expires_at: expiresAt,
    })

  if (insertError) return { error: insertError.message }

  const ownerName = ownerUser?.display_name ?? ownerUser?.username ?? 'Someone'
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`

  // In development, skip email and return the invite URL directly so it can
  // be tested without a verified sending domain or real inbox.
  if (process.env.NODE_ENV === 'development') {
    revalidatePath(`/list/${listId}/invites`)
    return { success: true, inviteUrl }
  }

  const { error: emailError } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: email,
    subject: `${ownerName} invited you to their wishlist`,
    html: `
      <p>Hi there,</p>
      <p><strong>${ownerName}</strong> has invited you to view their wishlist: <strong>${list.name}</strong>.</p>
      <p><a href="${inviteUrl}">Click here to accept the invite</a></p>
      <p>This invite expires in 7 days.</p>
    `,
  })

  if (emailError) {
    await supabase.from('list_invites').delete().eq('token', token)
    return { error: `Failed to send invite email: ${emailError.message}` }
  }

  revalidatePath(`/list/${listId}/invites`)
  return { success: true }
}

export async function acceptInvite(token: string): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be logged in to accept an invite.' }

  // Use admin client so we can read the invite regardless of RLS
  const adminClient = createAdminClient()
  const { data: invite } = await adminClient
    .from('list_invites')
    .select('id, invited_email, accepted_at, expires_at, user_id')
    .eq('token', token)
    .maybeSingle()

  if (!invite) return { error: 'Invite not found or has expired.' }
  if (invite.accepted_at) return { error: 'This invite has already been accepted.' }
  if (new Date(invite.expires_at) < new Date()) return { error: 'This invite has expired.' }
  if (invite.user_id && invite.user_id !== user.id) {
    return { error: 'This invite was sent to a different account.' }
  }

  const { data: authUser } = await supabase.auth.getUser()
  const userEmail = authUser.user?.email?.toLowerCase()
  if (userEmail !== invite.invited_email.toLowerCase()) {
    return { error: 'This invite was sent to a different email address.' }
  }

  const { error } = await adminClient
    .from('list_invites')
    .update({ user_id: user.id, accepted_at: new Date().toISOString() })
    .eq('id', invite.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return null
}

// useActionState-compatible wrapper for the invite acceptance page.
// Reads token from a hidden form input, accepts, and redirects on success.
export async function acceptInviteForm(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const token = formData.get('token') as string
  const result = await acceptInvite(token)
  if (result) return result
  redirect('/dashboard')
}

export async function revokeInvite(inviteId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: invite } = await supabase
    .from('list_invites')
    .select('list_id')
    .eq('id', inviteId)
    .eq('invited_by', user.id)
    .is('accepted_at', null)
    .single()

  if (!invite) return

  await supabase
    .from('list_invites')
    .delete()
    .eq('id', inviteId)
    .eq('invited_by', user.id)
    .is('accepted_at', null)

  revalidatePath(`/list/${invite.list_id}/invites`)
}
