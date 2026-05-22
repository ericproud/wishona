import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AccessDenied from './access-denied'
import MemberView from './member-view'
import type { Item, List, Profile, PurchaseWithGifter } from '@/types'

export default async function ListPage({
  params,
}: {
  params: Promise<{ username: string; slug: string }>
}) {
  const { username, slug } = await params
  const supabase = await createClient()

  // users table is public read — safe without auth
  const { data: ownerData } = await supabase
    .from('users')
    .select('id, username, first_name, last_name')
    .eq('username', username)
    .single()

  if (!ownerData) notFound()

  // Fetch profile, list (RLS-gated), and current user in parallel
  const [{ data: profile }, { data: list }, { data: { user } }] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', ownerData.id).single(),
    supabase.from('lists').select('id, name, slug, is_public').eq('owner_id', ownerData.id).eq('slug', slug).single(),
    supabase.auth.getUser(),
  ])

  // No list returned = doesn't exist, or is private and viewer isn't a member
  if (!list) {
    const ownerName = (ownerData.first_name && ownerData.last_name)
      ? `${ownerData.first_name} ${ownerData.last_name}`
      : ownerData.first_name ?? ownerData.username
    return <AccessDenied ownerName={ownerName} ownerUserId={ownerData.id} />
  }

  // Owner → redirect to the items edit page
  if (user?.id === ownerData.id) {
    redirect(`/list/${list.id}/edit`)
  }

  const isPublicList = list.is_public ?? false

  // Unauthenticated visitor on a public list — show items only, no purchases
  if (!user) {
    if (isPublicList) {
      const { data: itemsData } = await supabase
        .from('items')
        .select('*')
        .eq('list_id', list.id)
        .order('priority', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: true })

      return (
        <MemberView
          list={list as List}
          owner={{ id: ownerData.id, username: ownerData.username, first_name: ownerData.first_name ?? null, last_name: ownerData.last_name ?? null }}
          profile={profile as Profile | null}
          items={(itemsData ?? []) as Item[]}
          purchases={[]}
          currentUserId={null}
          isPublicList={true}
          listPath={`/${username}/${slug}`}
        />
      )
    }
    redirect('/login')
  }

  const { data: itemsData } = await supabase
    .from('items')
    .select('*')
    .eq('list_id', list.id)
    .order('priority', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true })

  const items = (itemsData ?? []) as Item[]

  const { data: purchasesData } = items.length > 0
    ? await supabase
        .from('purchases')
        .select('id, item_id, quantity, gifter_id, purchased_at, is_anonymous, gifter:users!purchases_gifter_id_fkey(id, first_name, last_name, username)')
        .in('item_id', items.map(i => i.id))
    : { data: [] }

  return (
    <MemberView
      list={list as List}
      owner={{ id: ownerData.id, username: ownerData.username, first_name: ownerData.first_name ?? null, last_name: ownerData.last_name ?? null }}
      profile={profile as Profile | null}
      items={items}
      purchases={(purchasesData ?? []) as unknown as PurchaseWithGifter[]}
      currentUserId={user.id}
      isPublicList={isPublicList}
      listPath={`/${username}/${slug}`}
    />
  )
}
