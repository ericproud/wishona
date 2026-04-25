import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/lib/actions/auth'
import { Button, buttonVariants } from '@/components/ui/button'
import ListsSection from './lists-section'
import type { List } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: lists } = await supabase
    .from('lists')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="flex items-center gap-2">
            <Link href="/profile/edit" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              Edit profile
            </Link>
            <form action={signOut}>
              <Button variant="outline" size="sm" type="submit">Log out</Button>
            </form>
          </div>
        </div>
        <ListsSection lists={(lists ?? []) as List[]} />
      </div>
    </main>
  )
}
