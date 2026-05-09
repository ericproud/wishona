'use client'

import { useActionState, useEffect, useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { updateItem, deleteItem } from '@/lib/actions/items'
import { scrapeItemUrl } from '@/lib/actions/scrape'
import { Button } from '@/components/ui/button'
import { PendingButton } from '@/components/ui/pending-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import ItemTile from '@/components/item-tile'
import type { Item } from '@/types'

function EditForm({ item, userId, onDone }: { item: Item; userId: string; onDone: () => void }) {
  const [state, action, isPending] = useActionState(updateItem.bind(null, item.id), null)
  const [name, setName] = useState(item.name)
  const [url, setUrl] = useState(item.url ?? '')
  const [price, setPrice] = useState(item.price !== null ? String(item.price) : '')
  const [quantity, setQuantity] = useState(String(item.quantity))
  const [notes, setNotes] = useState(item.notes ?? '')
  const [priority, setPriority] = useState(item.priority !== null ? String(item.priority) : '')
  const [imageUrl, setImageUrl] = useState(item.image_url ?? '')
  const [isScraping, startScraping] = useTransition()
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) await uploadImage(file)
    e.target.value = ''
  }

  async function uploadImage(file: File) {
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Image must be under 2 MB.')
      return
    }
    setUploadError(null)
    setUploading(true)
    const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
    const path = `${userId}/items/${crypto.randomUUID()}.${ext}`
    const supabase = createClient()
    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: false, contentType: file.type })
    if (error) {
      setUploadError(error.message)
      setUploading(false)
      return
    }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    setImageUrl(publicUrl)
    setUploading(false)
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

      <div className="space-y-1.5">
        <Label>Image <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <div className="flex items-center gap-3">
          {imageUrl ? (
            <div className="relative w-14 h-14 rounded border border-border overflow-hidden shrink-0 bg-muted">
              <Image src={imageUrl} alt="" fill className="object-contain" unoptimized />
            </div>
          ) : (
            <div className="w-14 h-14 rounded border border-dashed border-border bg-muted shrink-0" />
          )}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? 'Uploading…' : imageUrl ? 'Replace' : 'Upload photo'}
              </Button>
              {imageUrl && (
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                  onClick={() => setImageUrl('')}
                >
                  Remove
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Auto-filled from a link, or upload from your device · max 2 MB
            </p>
            {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
      </div>

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

      <div className="space-y-1.5">
        <Label htmlFor={`priority-${item.id}`}>Priority <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <select
          id={`priority-${item.id}`}
          name="priority"
          value={priority}
          onChange={e => setPriority(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">—</option>
          <option value="1">Most wanted</option>
          <option value="2">Would love it</option>
          <option value="3">Nice to have</option>
        </select>
      </div>

      {state && 'error' in state && (
        <p className="text-xs text-destructive">{state.error}</p>
      )}

      <div className="flex items-center gap-2 pt-2">
        <Button type="submit" disabled={isPending || isScraping || uploading} className="flex-1">{isPending ? 'Saving…' : 'Save changes'}</Button>
        <Button type="button" variant="ghost" onClick={onDone}>Cancel</Button>
      </div>
    </form>
  )
}

function ItemRow({ item, userId }: { item: Item; userId: string }) {
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
        priority={item.priority}
        footer={footer}
      />
      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col gap-0">
          <SheetHeader className="border-b border-border">
            <SheetTitle>Edit item</SheetTitle>
          </SheetHeader>
          <div className="p-5 overflow-y-auto flex-1">
            <EditForm item={item} userId={userId} onDone={() => setEditOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

export default function ItemList({ items, userId }: { items: Item[]; userId: string }) {
  if (items.length === 0) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 items-start">
      {items.map((item) => (
        <ItemRow key={item.id} item={item} userId={userId} />
      ))}
    </div>
  )
}
