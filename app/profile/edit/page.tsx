import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/lib/actions/auth'
import { Button, buttonVariants } from '@/components/ui/button'
import ProfileForm from './profile-form'
import type { User, Profile } from '@/types'

export default async function ProfileEditPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  const [{ data: userData }, { data: profileData }] = await Promise.all([
    supabase.from('users').select('*').eq('id', authUser.id).single(),
    supabase.from('profiles').select('*').eq('user_id', authUser.id).single(),
  ])

  const user = userData as User
  const profile = profileData as Profile | null

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/dashboard"
            className={buttonVariants({ variant: 'ghost', size: 'sm' })}
          >
            ← Dashboard
          </Link>
          <form action={signOut}>
            <Button variant="outline" size="sm" type="submit">Log out</Button>
          </form>
        </div>
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">Edit profile</h1>
          <p className="text-sm text-muted-foreground mt-1">
            This information is visible to people you invite to your lists.
          </p>
        </div>
        <ProfileForm user={user} profile={profile} />
      </div>
    </div>
  )
}
