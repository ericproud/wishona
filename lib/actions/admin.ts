'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== process.env.ADMIN_USER_ID) {
    redirect('/dashboard')
  }
  return user
}

export async function adminDeleteUser(userId: string): Promise<void> {
  await assertAdmin()
  const adminClient = createAdminClient()
  await adminClient.auth.admin.deleteUser(userId)
  revalidatePath('/admin')
}

export async function adminDeleteList(listId: string): Promise<void> {
  await assertAdmin()
  const adminClient = createAdminClient()
  await adminClient.from('lists').delete().eq('id', listId)
  revalidatePath('/admin')
}
