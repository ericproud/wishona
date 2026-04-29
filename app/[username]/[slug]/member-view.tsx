import Link from 'next/link'
import { buttonVariants, Button } from '@/components/ui/button'
import { signOut } from '@/lib/actions/auth'
import ItemCard from './item-card'
import type { Item, List, Profile, PurchaseWithGifter } from '@/types'

type Owner = { id: string; username: string; display_name: string | null }

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
  const sizeStr = sizes
    ? [
        sizes.shirt && `Shirt ${sizes.shirt}`,
        sizes.pants && `Pants ${sizes.pants}`,
        sizes.shoe && `Shoe ${sizes.shoe}`,
        sizes.dress && `Dress ${sizes.dress}`,
      ].filter(Boolean).join(' · ')
    : null

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Nav */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
            ← Dashboard
          </Link>
          <form action={signOut}>
            <Button variant="outline" size="sm" type="submit">Log out</Button>
          </form>
        </div>

        {/* Owner profile header */}
        <div className="mb-8">
          <p className="text-sm text-muted-foreground">
            {owner.display_name ?? owner.username}&apos;s list
          </p>
          <h1 className="text-2xl font-semibold mt-0.5">{list.name}</h1>
          {profile?.wishlist_note && (
            <p className="text-sm text-muted-foreground mt-2 italic">
              &ldquo;{profile.wishlist_note}&rdquo;
            </p>
          )}
          {(profile?.interests || sizeStr) && (
            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
              {profile?.interests && (
                <p>
                  <span className="font-medium text-foreground">Interests:</span>{' '}
                  {profile.interests}
                </p>
              )}
              {sizeStr && (
                <p>
                  <span className="font-medium text-foreground">Sizes:</span>{' '}
                  {sizeStr}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            No items on this list yet.
          </p>
        ) : (
          <ul className="space-y-3">
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
          </ul>
        )}
      </div>
    </div>
  )
}
