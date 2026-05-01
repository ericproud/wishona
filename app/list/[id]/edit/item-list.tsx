'use client'

import { useActionState, useEffect, useState, useTransition } from 'react'
import Image from 'next/image'
import { updateItem, deleteItem } from '@/lib/actions/items'
import { scrapeItemUrl } from '@/lib/actions/scrape'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
    <form action={action} className="space-y-3 py-1">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-1">
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
          <div className="sm:col-span-2 flex items-center gap-3">
            <div className="relative w-12 h-12 rounded border border-border overflow-hidden shrink-0 bg-muted">
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

        <div className="sm:col-span-2 space-y-1">
          <Label htmlFor={`name-${item.id}`}>Name</Label>
          <Input id={`name-${item.id}`} name="name" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`price-${item.id}`}>Price <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Input id={`price-${item.id}`} name="price" type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`quantity-${item.id}`}>Quantity</Label>
          <Input id={`quantity-${item.id}`} name="quantity" type="number" min="1" step="1" value={quantity} onChange={e => setQuantity(e.target.value)} />
        </div>
        <div className="sm:col-span-2 space-y-1">
          <Label htmlFor={`notes-${item.id}`}>Notes <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Input id={`notes-${item.id}`} name="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Size, color, or anything helpful for the gifter" />
        </div>
      </div>
      {state && 'error' in state && (
        <p className="text-xs text-destructive">{state.error}</p>
      )}
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={isPending || isScraping}>{isPending ? 'Saving…' : 'Save'}</Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>Cancel</Button>
      </div>
    </form>
  )
}

function ItemRow({ item }: { item: Item }) {
  const [mode, setMode] = useState<'view' | 'edit' | 'delete'>('view')

  if (mode === 'edit') {
    return (
      <div className="px-5 py-4 bg-muted/40">
        <EditForm item={item} onDone={() => setMode('view')} />
      </div>
    )
  }

  if (mode === 'delete') {
    return (
      <div className="px-5 py-3.5 bg-destructive/5">
        <div className="flex items-center gap-3">
          <p className="text-sm text-destructive flex-1">
            Delete &ldquo;{item.name}&rdquo;? This cannot be undone.
          </p>
          <form action={deleteItem.bind(null, item.id)}>
            <Button variant="destructive" size="sm" type="submit">Delete</Button>
          </form>
          <Button variant="ghost" size="sm" onClick={() => setMode('view')}>Cancel</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-5 py-3.5 flex items-start gap-3">
      {item.image_url ? (
        <div className="relative w-10 h-10 rounded border border-border overflow-hidden shrink-0 bg-muted mt-0.5">
          <Image src={item.image_url} alt="" fill className="object-contain" unoptimized />
        </div>
      ) : (
        <div className="w-10 h-10 rounded border border-border bg-muted shrink-0 mt-0.5 flex items-center justify-center">
          <svg className="w-4 h-4 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
          {item.quantity > 1 && (
            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">×{item.quantity}</span>
          )}
        </div>
        <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
          {item.price !== null && <span>${item.price.toFixed(2)}</span>}
          {item.price !== null && item.url && <span className="text-border">·</span>}
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline truncate max-w-[220px]"
            >
              View link
            </a>
          )}
        </div>
        {item.notes && <p className="text-xs text-muted-foreground">{item.notes}</p>}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button variant="ghost" size="sm" onClick={() => setMode('edit')}>Edit</Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => setMode('delete')}
        >
          Delete
        </Button>
      </div>
    </div>
  )
}

export default function ItemList({ items }: { items: Item[] }) {
  if (items.length === 0) return null

  return (
    <div className="bg-card border border-border rounded-lg divide-y divide-border">
      {items.map((item) => (
        <ItemRow key={item.id} item={item} />
      ))}
    </div>
  )
}
