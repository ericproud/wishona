'use client'

import { useActionState, useState } from 'react'
import { addItem } from '@/lib/actions/items'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ItemForm({ listId }: { listId: string }) {
  const [open, setOpen] = useState(false)
  const [state, action, isPending] = useActionState(addItem.bind(null, listId), null)
  const [prevState, setPrevState] = useState(state)

  if (state !== prevState) {
    setPrevState(state)
    if (state && 'success' in state) setOpen(false)
  }

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        Add item
      </Button>
    )
  }

  return (
    <form action={action} className="space-y-4 border border-border rounded-lg p-4 bg-card">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">New item</h2>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-1">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" placeholder="e.g. Kindle Paperwhite" required autoFocus />
        </div>

        <div className="sm:col-span-2 space-y-1">
          <Label htmlFor="url">
            Link <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input id="url" name="url" type="text" placeholder="https://..." />
        </div>

        <div className="space-y-1">
          <Label htmlFor="price">
            Price <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input id="price" name="price" type="number" min="0" step="0.01" placeholder="0.00" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="quantity">Quantity</Label>
          <Input id="quantity" name="quantity" type="number" min="1" step="1" defaultValue="1" />
        </div>

        <div className="sm:col-span-2 space-y-1">
          <Label htmlFor="notes">
            Notes <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input id="notes" name="notes" placeholder="Size, color, or anything helpful for the gifter" />
        </div>
      </div>

      {state && 'error' in state && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? 'Adding…' : 'Add item'}
      </Button>
    </form>
  )
}
