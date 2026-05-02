'use client'

import { useActionState, useEffect, useState, useTransition } from 'react'
import Image from 'next/image'
import { updateItem, deleteItem } from '@/lib/actions/items'
import { scrapeItemUrl } from '@/lib/actions/scrape'
import { Button } from '@/components/ui/button'
import { PendingButton } from '@/components/ui/pending-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import ItemTile from '@/components/item-tile'
import type { Item } from '@/types'

function EditForm({ item, onDone }: { item: Item; onDone: () => void }) {
  const [state, action, isPending] = useActionState(updateItem.bind(null, item.id), null)
  const [name, setName] = useState(item.name)
  const [url, setUrl] = useState(item.url ?? '')
  const [price, setPrice] = useState(item.price !== null ? String(item.price) : '')
  const [quantity, setQuantity] = useState(String(item.quantity))
  const [notes, setNotes] = useState(item.notes ?? '')
  const [imageUrl, setImageUrl] = useState(item.image_url ?? '')
  const [isScraping, startScraping] = useTransition()

  useEffect(() => {
    if (state && 'success' in state) onDone()
  }, [state, onDone])

  function triggerScrape(rawUrl: string) {
    if (!rawUrl.startsWith('http') || rawUrl === item.url) return
    startScraping(async () => {
      const data = await scrapeItemUrl(rawUrl)
      if (!data) return
      if (!name && data.title) setName(data.title)
      if (!price && data.price) setPrice(data.price)
      if (!notes && data.description) setNotes(data.description.slice(0, 200))
      if (!imageUrl && data.image) setImageUrl(data.image)
    })
  }

  function handleUrlPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData('text').trim()
    triggerScrape(pasted)
  }

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor={`url-${item.id}`}>Link <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <div className="relative">
          <Input
            id={`url-${item.id}`}
            name="url"
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onPaste={handleUrlPaste}
            placeholder="Paste a link to auto-fill…"
          />
          {isScraping && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg className="animate-spin h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 12 6.477 12 12h-4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {imageUrl && (
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14 rounded border border-border overflow-hidden shrink-0 bg-muted">
            <Image src={imageUrl} alt="" fill className="object-contain" unoptimized />
          </div>
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            onClick={() => setImageUrl('')}
          >
            Remove image
          </button>
        </div>
      )}

      <input type="hidden" name="image_url" value={imageUrl} />

      <div className="space-y-1.5">
        <Label htmlFor={`name-${item.id}`}>Name</Label>
        <Input id={`name-${item.id}`} name="name" value={name} onChange={e => setName(e.target.value)} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor={`price-${item.id}`}>Price <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Input id={`price-${item.id}`} name="price" type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`quantity-${item.id}`}>Quantity</Label>
          <Input id={`quantity-${item.id}`} name="quantity" type="number" min="1" step="1" value={quantity} onChange={e => setQuantity(e.target.value)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`notes-${item.id}`}>Notes <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <Input id={`notes-${item.id}`} name="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Size, color, or anything helpful for the gifter" />
      </div>

      {state && 'error' in state && (
        <p className="text-xs text-destructive">{state.error}</p>
      )}

      <div className="flex items-center gap-2 pt-2">
        <Button type="submit" disabled={isPending || isScraping} className="flex-1">{isPending ? 'Saving…' : 'Save changes'}</Button>
        <Button type="button" variant="ghost" onClick={onDone}>Cancel</Button>
      </div>
    </form>
  )
}

function ItemRow({ item }: { item: Item }) {
  const [editOpen, setEditOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const footer = confirmDelete ? (
    <div className="space-y-2">
      <p className="text-xs text-destructive font-medium">Delete this item?</p>
      <div className="flex items-center gap-1.5">
        <form action={deleteItem.bind(null, item.id)} className="flex-1">
          <PendingButton variant="destructive" size="sm" pendingLabel="…" className="w-full">
            Delete
          </PendingButton>
        </form>
        <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
          Cancel
        </Button>
      </div>
    </div>
  ) : (
    <div className="flex items-center gap-1.5">
      <Button variant="outline" size="sm" className="flex-1" onClick={() => setEditOpen(true)}>
        Edit
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive"
        onClick={() => setConfirmDelete(true)}
      >
        Delete
      </Button>
    </div>
  )

  return (
    <>
      <ItemTile
        imageUrl={item.image_url}
        name={item.name}
        price={item.price}
        quantity={item.quantity}
        url={item.url}
        notes={item.notes}
        footer={footer}
      />
      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col gap-0">
          <SheetHeader className="border-b border-border">
            <SheetTitle>Edit item</SheetTitle>
          </SheetHeader>
          <div className="p-5 overflow-y-auto flex-1">
            <EditForm item={item} onDone={() => setEditOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

export default function ItemList({ items }: { items: Item[] }) {
  if (items.length === 0) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 items-start">
      {items.map((item) => (
        <ItemRow key={item.id} item={item} />
      ))}
    </div>
  )
}
