'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const RESERVED_USERNAMES = new Set([
  'admin', 'api', 'login', 'signup', 'dashboard',
  'profile', 'list', 'assets', 'static', 'invite',
])

function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9-]{3,20}$/.test(username)
}

export async function signUp(_prevState: string | null, formData: FormData): Promise<string | null> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const username = formData.get('username') as string

  if (!isValidUsername(username)) {
    return 'Username must be 3–20 characters: letters, numbers, and hyphens only.'
  }
  if (RESERVED_USERNAMES.has(username.toLowerCase())) {
    return 'That username is not available.'
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    return error.message
  }

  redirect('/dashboard')
}

// State type for signIn — null means not yet submitted
export type SignInState = { error: string } | { redirectTo: string } | null

export async function signIn(
  _prevState: SignInState,
  formData: FormData
): Promise<SignInState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Invalid email or password.' }
  }

  const next = (formData.get('redirectTo') as string) || '/dashboard'
  return { redirectTo: next }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
