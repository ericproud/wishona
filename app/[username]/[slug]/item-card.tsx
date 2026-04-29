'use client'

import { useActionState, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { markPurchased, unmarkPurchased } from '@/lib/actions/purchases'
import type { Item, PurchaseWithGifter } from '@/types'

type Props = {
  item: Item
  myPurchase: PurchaseWithGifter | null
  otherPurchases: PurchaseWithGifter[]
  availableQty: number
  listPath: string
}

export default function ItemCard({ item, myPurchase, otherPurchases, availableQty, listPath }: Props) {
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

  return (
    <li className="border border-border rounded-lg px-4 py-4 bg-card space-y-3">
      {/* Item details */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm">{item.name}</p>
            {item.quantity > 1 && (
              <span className="text-xs text-muted-foreground shrink-0">×{item.quantity}</span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {item.price !== null && <span>${item.price.toFixed(2)}</span>}
            {item.url && (
              <a href={item.url} target="_blank" rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-foreground truncate max-w-[200px]">
                View link
              </a>
            )}
          </div>
          {item.notes && <p className="text-xs text-muted-foreground">{item.notes}</p>}
        </div>
        {isFullyClaimed && (
          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full shrink-0">
            Fully claimed
          </span>
        )}
      </div>

      {/* Who's getting what */}
      {hasActivity && (
        <div className="text-xs text-muted-foreground space-y-0.5 pt-2 border-t border-border">
          {item.quantity > 1 && totalClaimed > 0 && (
            <p>{totalClaimed} of {item.quantity} claimed</p>
          )}
          {otherPurchases.map(p => (
            <p key={p.id}>
              {p.gifter.display_name ?? p.gifter.username}
              {' '}{p.quantity > 1 ? `is getting ${p.quantity}` : 'is getting this'}
            </p>
          ))}
          {myPurchase && (
            <p className="text-foreground font-medium">
              You {myPurchase.quantity > 1 ? `are getting ${myPurchase.quantity}` : 'are getting this'}
            </p>
          )}
        </div>
      )}

      {/* Claim form */}
      {mode === 'claiming' && (
        <form action={claimAction} className="space-y-2">
          {availableQty > 1 ? (
            <div className="flex items-center gap-2">
              <label htmlFor={`qty-${item.id}`} className="text-xs text-muted-foreground shrink-0">
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
                className="h-7 w-20 text-xs"
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
          {claimState && 'error' in claimState && (
            <p className="text-xs text-destructive">{claimState.error}</p>
          )}
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" disabled={isClaiming}>
              {isClaiming ? 'Saving…' : 'Confirm'}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setMode('idle')}>Cancel</Button>
          </div>
        </form>
      )}

      {/* Unclaim confirmation */}
      {mode === 'unclaiming' && myPurchase && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Remove your claim on this item?</p>
          <div className="flex items-center gap-2">
            <form action={unmarkPurchased.bind(null, myPurchase.id, listPath)}>
              <Button variant="destructive" size="sm" type="submit">Yes, unclaim</Button>
            </form>
            <Button variant="ghost" size="sm" onClick={() => setMode('idle')}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Idle action buttons */}
      {mode === 'idle' && (
        <div className="flex items-center gap-2">
          {!isFullyClaimed && !myPurchase && (
            <Button size="sm" onClick={() => setMode('claiming')}>Mark as purchased</Button>
          )}
          {myPurchase && (
            <Button variant="outline" size="sm" onClick={() => setMode('unclaiming')}>Unclaim</Button>
          )}
        </div>
      )}
    </li>
  )
}
