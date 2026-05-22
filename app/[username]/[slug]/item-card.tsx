'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { markPurchased, unmarkPurchased } from '@/lib/actions/purchases'
import ItemTile from '@/components/item-tile'
import type { Item, PurchaseWithGifter } from '@/types'

type Props = {
  item: Item
  myPurchase: PurchaseWithGifter | null
  otherPurchases: PurchaseWithGifter[]
  availableQty: number
  currentUserId: string | null
  isPublicList: boolean
  listPath: string
}

function gifterName(g: { first_name: string | null; last_name: string | null; username: string }) {
  if (g.first_name && g.last_name) return `${g.first_name} ${g.last_name}`
  return g.first_name || g.username
}

export default function ItemCard({ item, myPurchase, otherPurchases, availableQty, currentUserId, isPublicList, listPath }: Props) {
  const [mode, setMode] = useState<'idle' | 'claiming' | 'unclaiming'>('idle')
  const [claimQty, setClaimQty] = useState(1)
  const [claimState, claimAction, isClaiming] = useActionState(
    markPurchased.bind(null, item.id, listPath),
    null
  )
  const [prevClaimState, setPrevClaimState] = useState(claimState)
  if (claimState !== prevClaimState) {
    setPrevClaimState(claimState)
    if (claimState && 'success' in claimState) setMode('idle')
  }

  const [prevMyPurchase, setPrevMyPurchase] = useState(myPurchase)
  if (myPurchase !== prevMyPurchase) {
    setPrevMyPurchase(myPurchase)
    if (myPurchase === null && mode === 'unclaiming') setMode('idle')
  }

  const totalClaimed = item.quantity - availableQty
  const isFullyClaimed = availableQty <= 0
  const hasActivity = myPurchase !== null || otherPurchases.length > 0

  const topRight = isFullyClaimed ? (
    <span className="text-[11px] font-medium bg-foreground/85 text-background px-2 py-0.5 rounded-full">
      Fully claimed
    </span>
  ) : myPurchase ? (
    <span className="text-[11px] font-medium bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
      You&apos;re getting it
    </span>
  ) : undefined

  const meta = hasActivity ? (
    <>
      {item.quantity > 1 && totalClaimed > 0 && (
        <p>{totalClaimed} of {item.quantity} claimed</p>
      )}
      {otherPurchases.map(p => (
        <p key={p.id}>
          {isPublicList || p.is_anonymous ? 'Someone' : gifterName(p.gifter)}
          {' '}{p.quantity > 1 ? `is getting ${p.quantity}` : 'is getting this'}
        </p>
      ))}
      {myPurchase && (
        <p className="text-foreground font-medium">
          You {myPurchase.quantity > 1 ? `are getting ${myPurchase.quantity}` : 'are getting this'}
        </p>
      )}
    </>
  ) : undefined

  let footer: React.ReactNode

  if (!currentUserId) {
    // Unauthenticated visitor on a public list
    footer = (
      <div className="flex items-center gap-1.5">
        {!isFullyClaimed ? (
          <Link href="/login" className={buttonVariants({ size: 'sm' }) + ' flex-1 text-center'}>
            Sign in to claim
          </Link>
        ) : (
          <p className="text-xs text-muted-foreground">Someone&apos;s already getting this.</p>
        )}
      </div>
    )
  } else if (mode === 'claiming') {
    footer = (
      <form action={claimAction} className="space-y-2">
        {availableQty > 1 ? (
          <div className="space-y-1">
            <label htmlFor={`qty-${item.id}`} className="text-xs text-muted-foreground">
              How many? (up to {availableQty})
            </label>
            <Input
              id={`qty-${item.id}`}
              name="quantity"
              type="number"
              min="1"
              max={availableQty}
              value={String(claimQty)}
              onChange={e => setClaimQty(Math.max(1, Math.min(availableQty, parseInt(e.target.value) || 1)))}
              className="h-8 text-xs"
            />
          </div>
        ) : (
          <>
            <input type="hidden" name="quantity" value="1" />
            {item.quantity > 1 && (
              <p className="text-xs text-muted-foreground">1 of {item.quantity} remaining.</p>
            )}
          </>
        )}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="is_anonymous"
            value="true"
            className="h-3.5 w-3.5 accent-primary"
          />
          <span className="text-xs text-muted-foreground">Claim anonymously</span>
        </label>
        {claimState && 'error' in claimState && (
          <p className="text-xs text-destructive">{claimState.error}</p>
        )}
        <div className="flex items-center gap-1.5">
          <Button type="submit" size="sm" disabled={isClaiming} className="flex-1">
            {isClaiming ? 'Saving…' : 'Confirm'}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setMode('idle')}>Cancel</Button>
        </div>
      </form>
    )
  } else if (mode === 'unclaiming' && myPurchase) {
    footer = (
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Remove your claim on this item?</p>
        <div className="flex items-center gap-1.5">
          <form action={unmarkPurchased.bind(null, myPurchase.id, listPath, item.list_id)} className="flex-1">
            <Button variant="destructive" size="sm" type="submit" className="w-full">Yes, unclaim</Button>
          </form>
          <Button variant="ghost" size="sm" onClick={() => setMode('idle')}>Cancel</Button>
        </div>
      </div>
    )
  } else {
    footer = (
      <div className="flex items-center gap-1.5">
        {!isFullyClaimed && !myPurchase && (
          <Button size="sm" onClick={() => setMode('claiming')} className="flex-1">
            Mark as purchased
          </Button>
        )}
        {myPurchase && (
          <Button variant="outline" size="sm" onClick={() => setMode('unclaiming')} className="flex-1">
            Unclaim
          </Button>
        )}
        {isFullyClaimed && !myPurchase && (
          <p className="text-xs text-muted-foreground">Someone&apos;s already getting this.</p>
        )}
      </div>
    )
  }

  return (
    <ItemTile
      imageUrl={item.image_url}
      name={item.name}
      price={item.price}
      quantity={item.quantity}
      url={item.url}
      notes={item.notes}
      priority={item.priority}
      topRight={topRight}
      meta={meta}
      footer={footer}
      dimmed={isFullyClaimed && !myPurchase}
    />
  )
}
