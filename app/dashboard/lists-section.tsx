'use client'

import { useState } from 'react'
import Link from 'next/link'
import { updateList, deleteList } from '@/lib/actions/lists'
import { Button, buttonVariants } from '@/components/ui/button'
import { PendingButton } from '@/components/ui/pending-button'
import { Input } from '@/components/ui/input'
import EmptyStateCard from '@/components/empty-state-card'
import ListCard from '@/components/list-card'
import type { List } from '@/types'

interface ListsSectionProps {
  lists: List[]
  itemCounts: Record<string, number>
  coverImagesByList: Record<string, string[]>
  pendingInviteCounts: Record<string, number>
  acceptedInviteCounts: Record<string, number>
}

export default function ListsSection({
  lists,
  itemCounts,
  coverImagesByList,
  pendingInviteCounts,
  acceptedInviteCounts,
}: ListsSectionProps) {
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
        <EmptyStateCard
          title="No lists yet."
          description="Create your first wishlist and invite the people who'll be shopping for you."
          action={
            <Link href="/list/new" className={buttonVariants({ size: 'sm' })}>
              Create your first list
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lists.map((list) => {
            const items = itemCounts[list.id] ?? 0
            const gifters = acceptedInviteCounts[list.id] ?? 0
            const pending = pendingInviteCounts[list.id] ?? 0

            if (renamingId === list.id) {
              return (
                <div key={list.id} className="bg-card border border-border rounded-lg p-4 flex flex-col justify-center min-h-[280px]">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Rename list</p>
                  <form
                    action={updateList.bind(null, list.id)}
                    onSubmit={() => setRenamingId(null)}
                    className="space-y-2"
                  >
                    <Input name="name" defaultValue={list.name} required autoFocus className="h-9 text-sm" />
                    <div className="flex items-center gap-2">
                      <PendingButton size="sm" pendingLabel="Saving…">Save</PendingButton>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setRenamingId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )
            }

            if (confirmingId === list.id) {
              return (
                <div key={list.id} className="bg-destructive/5 border border-destructive/30 rounded-lg p-4 flex flex-col justify-center min-h-[280px] gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Delete &ldquo;{list.name}&rdquo;?</p>
                    <p className="text-xs text-muted-foreground mt-1">This cannot be undone.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <form action={deleteList.bind(null, list.id)}>
                      <PendingButton variant="destructive" size="sm" pendingLabel="Deleting…">
                        Delete
                      </PendingButton>
                    </form>
                    <Button variant="ghost" size="sm" onClick={() => setConfirmingId(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )
            }

            return (
              <ListCard
                key={list.id}
                href={`/list/${list.id}/edit`}
                name={list.name}
                coverImages={coverImagesByList[list.id] ?? []}
                metadata={
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span>{items} {items === 1 ? 'item' : 'items'}</span>
                    {gifters > 0 && (
                      <>
                        <span className="text-border">·</span>
                        <span>{gifters} {gifters === 1 ? 'gifter' : 'gifters'}</span>
                      </>
                    )}
                    {pending > 0 && (
                      <>
                        <span className="text-border">·</span>
                        <span>{pending} pending</span>
                      </>
                    )}
                  </div>
                }
                actions={
                  <div className="flex items-center gap-1 -mx-2">
                    <Link
                      href={`/list/${list.id}/invites`}
                      className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                    >
                      Invites
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
                      className="text-destructive hover:text-destructive ml-auto"
                      onClick={() => { setRenamingId(null); setConfirmingId(list.id) }}
                    >
                      Delete
                    </Button>
                  </div>
                }
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
