'use client'

import { useState } from 'react'
import Link from 'next/link'
import { updateList, deleteList } from '@/lib/actions/lists'
import { Button, buttonVariants } from '@/components/ui/button'
import { PendingButton } from '@/components/ui/pending-button'
import { Input } from '@/components/ui/input'
import type { List } from '@/types'

interface ListsSectionProps {
  lists: List[]
  itemCounts: Record<string, number>
  pendingInviteCounts: Record<string, number>
  acceptedInviteCounts: Record<string, number>
}

export default function ListsSection({ lists, itemCounts, pendingInviteCounts, acceptedInviteCounts }: ListsSectionProps) {
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-foreground">Your lists</h2>
        <Link href="/list/new" className={buttonVariants({ size: 'sm' })}>
          New list
        </Link>
      </div>

      {lists.length === 0 ? (
        <div className="bg-card border border-border rounded-lg px-5 py-10 text-center">
          <p className="text-sm text-muted-foreground">No lists yet.</p>
          <Link
            href="/list/new"
            className="text-sm text-primary font-medium hover:underline mt-1 inline-block"
          >
            Create your first list →
          </Link>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg divide-y divide-border">
          {lists.map((list) => (
            <div key={list.id} className="px-5 py-3.5">
              {renamingId === list.id ? (
                <form
                  action={updateList.bind(null, list.id)}
                  onSubmit={() => setRenamingId(null)}
                  className="flex items-center gap-2"
                >
                  <Input name="name" defaultValue={list.name} required autoFocus className="h-8 text-sm" />
                  <PendingButton size="sm" pendingLabel="Saving…">Save</PendingButton>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setRenamingId(null)}>
                    Cancel
                  </Button>
                </form>
              ) : confirmingId === list.id ? (
                <div className="flex items-center gap-3">
                  <p className="text-sm text-destructive flex-1">
                    Delete &ldquo;{list.name}&rdquo;? This cannot be undone.
                  </p>
                  <form action={deleteList.bind(null, list.id)}>
                    <PendingButton variant="destructive" size="sm" pendingLabel="Deleting…">
                      Delete
                    </PendingButton>
                  </form>
                  <Button variant="ghost" size="sm" onClick={() => setConfirmingId(null)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{list.name}</p>
                    <div className="flex items-center gap-2.5 text-xs text-muted-foreground mt-0.5">
                      <span>{itemCounts[list.id] ?? 0} {(itemCounts[list.id] ?? 0) === 1 ? 'item' : 'items'}</span>
                      {(acceptedInviteCounts[list.id] ?? 0) > 0 && (
                        <>
                          <span className="text-border">·</span>
                          <span>{acceptedInviteCounts[list.id]} {acceptedInviteCounts[list.id] === 1 ? 'gifter' : 'gifters'}</span>
                        </>
                      )}
                      {(pendingInviteCounts[list.id] ?? 0) > 0 && (
                        <>
                          <span className="text-border">·</span>
                          <span>{pendingInviteCounts[list.id]} pending</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      href={`/list/${list.id}/invites`}
                      className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                    >
                      Invites
                    </Link>
                    <Link
                      href={`/list/${list.id}/edit`}
                      className={buttonVariants({ variant: 'outline', size: 'sm' })}
                    >
                      Edit items
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setConfirmingId(null); setRenamingId(list.id) }}
                    >
                      Rename
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => { setRenamingId(null); setConfirmingId(list.id) }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
