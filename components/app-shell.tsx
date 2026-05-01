import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/lib/actions/auth'

interface AppShellProps {
  children: React.ReactNode
}

export default async function AppShell({ children }: AppShellProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let navName: string | null = null
  if (user) {
    const { data } = await supabase
      .from('users')
      .select('first_name, last_name, username')
      .eq('id', user.id)
      .single()
    if (data?.first_name && data?.last_name) {
      navName = `${data.first_name} ${data.last_name}`
    } else if (data?.first_name) {
      navName = data.first_name
    } else {
      navName = data?.username ?? null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-nav sticky top-0 z-50">
        <div className="max-w-[960px] mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-white font-semibold text-sm tracking-tight hover:text-white/80 transition-colors"
          >
            Gift Simple
          </Link>
          {user && (
            <div className="flex items-center gap-5">
              {navName && (
                <Link
                  href="/profile/edit"
                  className="text-sm text-white/60 hover:text-white/90 transition-colors"
                >
                  {navName}
                </Link>
              )}
              <form action={signOut}>
                <button
                  type="submit"
                  className="text-sm text-white/60 hover:text-white/90 transition-colors cursor-pointer"
                >
                  Log out
                </button>
              </form>
            </div>
          )}
        </div>
      </header>
      <main className="max-w-[960px] mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
