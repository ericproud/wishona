'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import EmptyStateCard from '@/components/empty-state-card'
import ItemCard from './item-card'
import type { Item, PurchaseWithGifter } from '@/types'

type Props = {
  items: Item[]
  purchases: PurchaseWithGifter[]
  currentUserId: string | null
  isPublicList: boolean
  listPath: string
}

export default function ItemsGrid({ items, purchases, currentUserId, isPublicList, listPath }: Props) {
  const [showAvailableOnly, setShowAvailableOnly] = useState(false)

  const enriched = items.map(item => {
    const itemPurchases = purchases.filter(p => p.item_id === item.id)
    const myPurchase = currentUserId
      ? (itemPurchases.find(p => p.gifter_id === currentUserId) ?? null)
      : null
    const otherPurchases = currentUserId
      ? itemPurchases.filter(p => p.gifter_id !== currentUserId)
      : itemPurchases
    const totalClaimed = itemPurchases.reduce((sum, p) => sum + p.quantity, 0)
    const availableQty = item.quantity - totalClaimed
    return { item, myPurchase, otherPurchases, availableQty }
  })

  const availableCount = enriched.filter(({ availableQty }) => availableQty > 0).length
  const displayed = showAvailableOnly
    ? enriched.filter(({ availableQty }) => availableQty > 0)
    : enriched

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button
          variant={showAvailableOnly ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowAvailableOnly(v => !v)}
          className="h-8 text-xs"
        >
          Available only
        </Button>
        <span className="text-xs text-muted-foreground">
          {availableCount} of {items.length} available
        </span>
      </div>

      {displayed.length === 0 ? (
        <EmptyStateCard
          title="All items have been claimed!"
          description="Every gift on this list has been reserved. Turn off the filter to see the full list."
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 items-start">
          {displayed.map(({ item, myPurchase, otherPurchases, availableQty }) => (
            <ItemCard
              key={item.id}
              item={item}
              myPurchase={myPurchase}
              otherPurchases={otherPurchases}
              availableQty={availableQty}
              currentUserId={currentUserId}
              isPublicList={isPublicList}
              listPath={listPath}
            />
          ))}
        </div>
      )}
    </div>
  )
}
