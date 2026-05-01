'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type ProfileState = { error: string } | { success: true } | null

export async function updateProfile(
  _prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const firstName = (formData.get('first_name') as string).trim()
  const lastName = (formData.get('last_name') as string).trim()
  const interests = (formData.get('interests') as string).trim()
  const wishlistNote = (formData.get('wishlist_note') as string).trim()
  const shirt = (formData.get('shirt') as string).trim()
  const pants = (formData.get('pants') as string).trim()
  const shoe = (formData.get('shoe') as string).trim()
  const dress = (formData.get('dress') as string).trim()

  const clothingSizes = { shirt, pants, shoe, dress }

  const { error: userError } = await supabase
    .from('users')
    .update({ first_name: firstName || null, last_name: lastName || null })
    .eq('id', user.id)

  if (userError) return { error: userError.message }

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      user_id: user.id,
      clothing_sizes: clothingSizes,
      interests: interests || null,
      wishlist_note: wishlistNote || null,
    })

  if (profileError) return { error: profileError.message }

  return { success: true }
}

export async function updateAvatarUrl(avatarUrl: string): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated.' }

  const { error } = await supabase
    .from('profiles')
    .upsert({ user_id: user.id, avatar_url: avatarUrl })

  if (error) return { error: error.message }
  return null
}
