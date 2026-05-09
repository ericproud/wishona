'use client'

import { useActionState, useRef, useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { addItem } from '@/lib/actions/items'
import { scrapeItemUrl } from '@/lib/actions/scrape'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import Image from 'next/image'

export default function ItemForm({ listId, userId }: { listId: string; userId: string }) {
  const [open, setOpen] = useState(false)
  const [state, action, isPending] = useActionState(addItem.bind(null, listId), null)
  const [prevState, setPrevState] = useState(state)

  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [price, setPrice] = useState('')
  const [notes, setNotes] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [priority, setPriority] = useState('')
  const [isScraping, startScraping] = useTransition()
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (state !== prevState) {
    setPrevState(state)
    if (state && 'success' in state) {
      setOpen(false)
      setName('')
      setUrl('')
      setPrice('')
      setNotes('')
      setImageUrl('')
      setPriority('')
      setUploadError(null)
    }
  }

  function triggerScrape(rawUrl: string) {
    if (!rawUrl.startsWith('http')) return
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
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        Add item
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col gap-0">
          <SheetHeader className="border-b border-border">
            <SheetTitle>Add item</SheetTitle>
          </SheetHeader>
          <form action={action} className="p-5 overflow-y-auto flex-1 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="url">
                Link <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <div className="relative">
                <Input
                  id="url"
                  name="url"
                  type="text"
                  placeholder="Paste a link to auto-fill…"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onPaste={handleUrlPaste}
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
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. Kindle Paperwhite"
                required
                autoFocus={!isScraping}
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="price">
                  Price <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" name="quantity" type="number" min="1" step="1" defaultValue="1" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">
                Notes <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="notes"
                name="notes"
                placeholder="Size, color, or anything helpful for the gifter"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="priority">
                Priority <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <select
                id="priority"
                name="priority"
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">No priority</option>
                <option value="1">Most wanted</option>
                <option value="2">Would love it</option>
                <option value="3">Nice to have</option>
              </select>
            </div>

            {state && 'error' in state && (
              <div className="bg-destructive/8 border border-destructive/20 text-destructive text-sm rounded-md px-3 py-2">
                {state.error}
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <Button type="submit" disabled={isPending || isScraping || uploading} className="flex-1">
                {isPending ? 'Adding…' : 'Add item'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
}
