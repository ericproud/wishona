import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/app-shell'
import ProfileForm from './profile-form'
import type { User, Profile } from '@/types'

export default async function ProfileEditPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) redirect('/login')

  const [{ data: userData }, { data: profileData }] = await Promise.all([
    supabase.from('users').select('*').eq('id', authUser.id).single(),
    supabase.from('profiles').select('*').eq('user_id', authUser.id).single(),
  ])

  const user = userData as User
  const profile = profileData as Profile | null

  return (
    <AppShell>
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
          Dashboard
        </Link>
        <span className="text-border">›</span>
        <span className="text-foreground">Profile</span>
      </div>

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">Edit profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          This information is visible to people you invite to your lists.
        </p>
      </div>

      <ProfileForm user={user} profile={profile} />
    </AppShell>
  )
}
