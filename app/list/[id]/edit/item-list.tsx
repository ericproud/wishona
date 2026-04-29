'use client'

import { useActionState, useEffect, useState } from 'react'
import { updateItem, deleteItem } from '@/lib/actions/items'
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

  useEffect(() => {
    if (state && 'success' in state) onDone()
  }, [state, onDone])

  return (
    <form action={action} className="space-y-3 pt-1">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-1">
          <Label htmlFor={`name-${item.id}`}>Name</Label>
          <Input id={`name-${item.id}`} name="name" value={name} onChange={e => setName(e.target.value)} required />
        </div>

        <div className="sm:col-span-2 space-y-1">
          <Label htmlFor={`url-${item.id}`}>
            Link <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input id={`url-${item.id}`} name="url" type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." />
        </div>

        <div className="space-y-1">
          <Label htmlFor={`price-${item.id}`}>
            Price <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            id={`price-${item.id}`}
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor={`quantity-${item.id}`}>Quantity</Label>
          <Input
            id={`quantity-${item.id}`}
            name="quantity"
            type="number"
            min="1"
            step="1"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
          />
        </div>

        <div className="sm:col-span-2 space-y-1">
          <Label htmlFor={`notes-${item.id}`}>
            Notes <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            id={`notes-${item.id}`}
            name="notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Size, color, or anything helpful for the gifter"
          />
        </div>
      </div>

      {state && 'error' in state && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? 'Saving…' : 'Save'}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

function ItemRow({ item }: { item: Item }) {
  const [mode, setMode] = useState<'view' | 'edit' | 'delete'>('view')

  if (mode === 'edit') {
    return (
      <li className="border border-border rounded-lg px-4 py-3 bg-card">
        <EditForm item={item} onDone={() => setMode('view')} />
      </li>
    )
  }

  if (mode === 'delete') {
    return (
      <li className="border border-destructive/40 rounded-lg px-4 py-3 bg-card">
        <div className="flex items-center gap-3">
          <p className="text-sm text-destructive flex-1">
            Delete &ldquo;{item.name}&rdquo;? This cannot be undone.
          </p>
          <form action={deleteItem.bind(null, item.id)}>
            <Button variant="destructive" size="sm" type="submit">Delete</Button>
          </form>
          <Button variant="ghost" size="sm" onClick={() => setMode('view')}>
            Cancel
          </Button>
        </div>
      </li>
    )
  }

  return (
    <li className="border border-border rounded-lg px-4 py-3 bg-card">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">{item.name}</p>
            {item.quantity > 1 && (
              <span className="text-xs text-muted-foreground shrink-0">×{item.quantity}</span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {item.price !== null && (
              <span>${item.price.toFixed(2)}</span>
            )}
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-foreground truncate max-w-[200px]"
              >
                View link
              </a>
            )}
          </div>
          {item.notes && (
            <p className="text-xs text-muted-foreground">{item.notes}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="sm" onClick={() => setMode('edit')}>Edit</Button>
          <Button variant="ghost" size="sm" onClick={() => setMode('delete')}>Delete</Button>
        </div>
      </div>
    </li>
  )
}

export default function ItemList({ items }: { items: Item[] }) {
  if (items.length === 0) return null

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <ItemRow key={item.id} item={item} />
      ))}
    </ul>
  )
}
