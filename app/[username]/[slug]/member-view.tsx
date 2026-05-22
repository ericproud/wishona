import Link from 'next/link'
import { signOut } from '@/lib/actions/auth'
import EmptyStateCard from '@/components/empty-state-card'
import UserAvatar from '@/components/ui/user-avatar'
import ItemsGrid from './items-grid'
import { formatEventDate } from '@/lib/utils'
import type { Item, List, Profile, PurchaseWithGifter } from '@/types'

type Owner = { id: string; username: string; first_name: string | null; last_name: string | null }

type Props = {
  list: List
  owner: Owner
  profile: Profile | null
  items: Item[]
  purchases: PurchaseWithGifter[]
  currentUserId: string | null
  isPublicList: boolean
  listPath: string
}

export default function MemberView({ list, owner, profile, items, purchases, currentUserId, isPublicList, listPath }: Props) {
  const sizes = profile?.clothing_sizes
  const sizeEntries = sizes
    ? [
        sizes.shirt && `Shirt ${sizes.shirt}`,
        sizes.pants && `Pants ${sizes.pants}`,
        sizes.shoe && `Shoe ${sizes.shoe}`,
        sizes.dress && `Dress ${sizes.dress}`,
      ].filter(Boolean)
    : []

  const ownerName = (owner.first_name && owner.last_name)
    ? `${owner.first_name} ${owner.last_name}`
    : owner.first_name ?? owner.username
  const eventDate = list.event_date ? formatEventDate(list.event_date) : null

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="bg-nav sticky top-0 z-50">
        <div className="max-w-[1100px] mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="text-white font-semibold text-sm tracking-tight hover:text-white/80 transition-colors">
            Wishona
          </Link>
          <div className="flex items-center gap-5">
            {currentUserId ? (
              <>
                <Link href="/dashboard" className="text-sm text-white/60 hover:text-white/90 transition-colors">
                  Dashboard
                </Link>
                <form action={signOut}>
                  <button type="submit" className="text-sm text-white/60 hover:text-white/90 transition-colors cursor-pointer">
                    Log out
                  </button>
                </form>
              </>
            ) : (
              <Link href="/login" className="text-sm text-white/60 hover:text-white/90 transition-colors">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-6 py-8">
        {/* Owner profile header */}
        <div className="bg-card border border-border rounded-lg p-5 sm:p-6 mb-6 flex flex-col sm:flex-row sm:items-start gap-4">
          <UserAvatar
            avatarUrl={profile?.avatar_url ?? null}
            firstName={owner.first_name}
            lastName={owner.last_name}
            username={owner.username}
            size="lg"
            className="size-14 text-base shrink-0"
          />
          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                {ownerName}&apos;s wishlist
              </p>
              <h1 className="text-xl font-semibold text-foreground">{list.name}</h1>
              {eventDate && (
                <p className={`text-sm mt-0.5 ${eventDate.isPast ? 'text-muted-foreground/60' : 'text-primary font-medium'}`}>
                  {eventDate.absolute}
                </p>
              )}
            </div>
            {profile?.wishlist_note && (
              <p className="text-sm text-muted-foreground italic">
                &ldquo;{profile.wishlist_note}&rdquo;
              </p>
            )}
            {(profile?.interests || sizeEntries.length > 0) && (
              <div className="space-y-1 pt-1">
                {profile?.interests && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Interests:</span>{' '}
                    {profile.interests}
                  </p>
                )}
                {sizeEntries.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Sizes:</span>{' '}
                    {sizeEntries.join(' · ')}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <EmptyStateCard
            title="No items on this list yet."
            description="Check back soon — the list owner is still adding ideas."
          />
        ) : (
          <ItemsGrid
            items={items}
            purchases={purchases}
            currentUserId={currentUserId}
            isPublicList={isPublicList}
            listPath={listPath}
          />
        )}
      </main>
    </div>
  )
}
