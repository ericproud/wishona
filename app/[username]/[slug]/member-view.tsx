import Link from 'next/link'
import { signOut } from '@/lib/actions/auth'
import ItemCard from './item-card'
import type { Item, List, Profile, PurchaseWithGifter } from '@/types'

type Owner = { id: string; username: string; first_name: string | null; last_name: string | null }

type Props = {
  list: List
  owner: Owner
  profile: Profile | null
  items: Item[]
  purchases: PurchaseWithGifter[]
  currentUserId: string
  listPath: string
}

export default function MemberView({ list, owner, profile, items, purchases, currentUserId, listPath }: Props) {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="bg-nav sticky top-0 z-50">
        <div className="max-w-[960px] mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="text-white font-semibold text-sm tracking-tight hover:text-white/80 transition-colors">
            Gift Simple
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/dashboard" className="text-sm text-white/60 hover:text-white/90 transition-colors">
              Dashboard
            </Link>
            <form action={signOut}>
              <button type="submit" className="text-sm text-white/60 hover:text-white/90 transition-colors cursor-pointer">
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-[960px] mx-auto px-6 py-8">
        {/* Owner profile header */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
            {ownerName}&apos;s wishlist
          </p>
          <h1 className="text-xl font-semibold text-foreground">{list.name}</h1>

          {profile?.wishlist_note && (
            <p className="text-sm text-muted-foreground mt-2 italic">
              &ldquo;{profile.wishlist_note}&rdquo;
            </p>
          )}

          {(profile?.interests || sizeEntries.length > 0) && (
            <div className="mt-4 pt-4 border-t border-border space-y-1.5">
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

        {/* Items */}
        {items.length === 0 ? (
          <div className="bg-card border border-border rounded-lg px-5 py-12 text-center">
            <p className="text-sm text-muted-foreground">No items on this list yet.</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg divide-y divide-border">
            {items.map(item => {
              const itemPurchases = purchases.filter(p => p.item_id === item.id)
              const myPurchase = itemPurchases.find(p => p.gifter_id === currentUserId) ?? null
              const otherPurchases = itemPurchases.filter(p => p.gifter_id !== currentUserId)
              const totalClaimed = itemPurchases.reduce((sum, p) => sum + p.quantity, 0)
              const availableQty = item.quantity - totalClaimed

              return (
                <ItemCard
                  key={item.id}
                  item={item}
                  myPurchase={myPurchase}
                  otherPurchases={otherPurchases}
                  availableQty={availableQty}
                  listPath={listPath}
                />
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
