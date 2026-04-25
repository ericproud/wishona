'use client'

import { useState } from 'react'
import Link from 'next/link'
import { updateList, deleteList } from '@/lib/actions/lists'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { List } from '@/types'

interface ListsSectionProps {
  lists: List[]
}

export default function ListsSection({ lists }: ListsSectionProps) {
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your lists</h2>
        <Link href="/list/new" className={buttonVariants({ size: 'sm' })}>
          New list
        </Link>
      </div>

      {lists.length === 0 && (
        <p className="text-sm text-muted-foreground py-6 text-center">
          You don&apos;t have any lists yet.{' '}
          <Link href="/list/new" className="underline underline-offset-4 hover:text-foreground">
            Create one
          </Link>
          .
        </p>
      )}

      <ul className="space-y-2">
        {lists.map((list) => (
          <li key={list.id} className="border border-border rounded-lg px-4 py-3 bg-card">
            {renamingId === list.id ? (
              <form
                action={updateList.bind(null, list.id)}
                onSubmit={() => setRenamingId(null)}
                className="flex items-center gap-2"
              >
                <Input
                  name="name"
                  defaultValue={list.name}
                  required
                  autoFocus
                  className="h-7 text-sm"
                />
                <Button type="submit" size="sm">Save</Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setRenamingId(null)}
                >
                  Cancel
                </Button>
              </form>
            ) : confirmingId === list.id ? (
              <div className="flex items-center gap-3">
                <p className="text-sm text-destructive flex-1">
                  Delete &ldquo;{list.name}&rdquo;? This cannot be undone.
                </p>
                <form
                  action={deleteList.bind(null, list.id)}
                  onSubmit={() => setConfirmingId(null)}
                >
                  <Button variant="destructive" size="sm" type="submit">Delete</Button>
                </form>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmingId(null)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{list.name}</p>
                </div>
                <Link
                  href={`/list/${list.id}/edit`}
                  className={buttonVariants({ variant: 'outline', size: 'sm' })}
                >
                  Add items
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setConfirmingId(null)
                    setRenamingId(list.id)
                  }}
                >
                  Rename
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setRenamingId(null)
                    setConfirmingId(list.id)
                  }}
                >
                  Delete
                </Button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
