'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Resend } from 'resend'
import { createClient, createAdminClient } from '@/lib/supabase/server'

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
    .select('email, first_name, last_name, username')
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

  const ownerName = (ownerUser?.first_name && ownerUser?.last_name)
    ? `${ownerUser.first_name} ${ownerUser.last_name}`
    : ownerUser?.first_name ?? ownerUser?.username ?? 'Someone'
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`

  // In development, skip email and return the invite URL directly so it can
  // be tested without a verified sending domain or real inbox.
  if (process.env.NODE_ENV === 'development') {
    revalidatePath(`/list/${listId}/invites`)
    return { success: true, inviteUrl }
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error: emailError } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: email,
    subject: `${ownerName} invited you to view their wishlist on Wishona`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9fafb;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%);">
                    <td align="center" style="padding: 30px 20px;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Wishona</h1>
                      <p style="margin: 8px 0 0 0; color: #d1d5db; font-size: 14px;">Smart wishlists for meaningful gifts</p>
                    </td>
                  </tr>

                  <!-- Main content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px 0; font-size: 16px;"><strong>${ownerName}</strong> has invited you to view their wishlist on Wishona!</p>

                      <div style="background-color: #f3f4f6; border-left: 4px solid #059669; padding: 16px; margin: 20px 0; border-radius: 4px;">
                        <p style="margin: 0; font-size: 15px;"><strong>Wishlist:</strong> <span style="color: #059669; font-weight: 600;">${list.name}</span></p>
                      </div>

                      <h3 style="margin: 30px 0 12px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">What is Wishona?</h3>
                      <p style="margin: 0 0 16px 0; font-size: 14px; color: #6b7280;">Wishona is a platform for creating and sharing wishlists. When someone invites you to a wishlist, you can see exactly what they want and claim items before you buy them — preventing duplicate gifts and making shopping easy.</p>

                      <h3 style="margin: 24px 0 12px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">What happens next?</h3>
                      <ol style="margin: 0 0 24px 20px; padding: 0; font-size: 14px; color: #6b7280;">
                        <li style="margin-bottom: 8px;">Click the button below to view the wishlist</li>
                        <li style="margin-bottom: 8px;">Create an account or sign in (takes 30 seconds)</li>
                        <li style="margin-bottom: 0;">Browse items and claim what you want to gift</li>
                      </ol>

                      <!-- CTA Button -->
                      <table cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                        <tr>
                          <td align="center" style="background-color: #059669; border-radius: 6px;">
                            <a href="${inviteUrl}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">View Wishlist</a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 24px 0 0 0; font-size: 13px; color: #9ca3af;">This invite expires in 7 days. If you have any questions, feel free to reach out to ${ownerName}.</p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 30px; border-top: 1px solid #e5e7eb; background-color: #f9fafb;">
                      <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
                        © 2026 Wishona. All rights reserved.<br />
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #059669; text-decoration: none;">Visit Wishona →</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
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
