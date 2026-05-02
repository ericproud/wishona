'use client'

import { useActionState, useState, useTransition } from 'react'
import { addItem } from '@/lib/actions/items'
import { scrapeItemUrl } from '@/lib/actions/scrape'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import Image from 'next/image'

export default function ItemForm({ listId }: { listId: string }) {
  const [open, setOpen] = useState(false)
  const [state, action, isPending] = useActionState(addItem.bind(null, listId), null)
  const [prevState, setPrevState] = useState(state)

  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [price, setPrice] = useState('')
  const [notes, setNotes] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isScraping, startScraping] = useTransition()

  if (state !== prevState) {
    setPrevState(state)
    if (state && 'success' in state) {
      setOpen(false)
      setName('')
      setUrl('')
      setPrice('')
      setNotes('')
      setImageUrl('')
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

            {state && 'error' in state && (
              <div className="bg-destructive/8 border border-destructive/20 text-destructive text-sm rounded-md px-3 py-2">
                {state.error}
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <Button type="submit" disabled={isPending || isScraping} className="flex-1">
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
