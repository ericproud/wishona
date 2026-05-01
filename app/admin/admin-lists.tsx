'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { adminDeleteList } from '@/lib/actions/admin'

type AdminList = {
  id: string
  name: string
  slug: string
  owner_id: string
  owner_username: string
  created_at: string | null
  item_count: number
}

export default function AdminLists({ lists }: { lists: AdminList[] }) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  return (
    <div>
      <h2 className="text-sm font-semibold text-foreground mb-3">Lists ({lists.length})</h2>
      {lists.length === 0 ? (
        <div className="bg-card border border-border rounded-lg px-5 py-8 text-center">
          <p className="text-sm text-muted-foreground">No lists.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Owner</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Items</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Created</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {lists.map(l => (
                <tr key={l.id}>
                  <td className="px-5 py-3.5 font-medium text-foreground">{l.name}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{l.owner_username}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{l.item_count}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {l.created_at ? l.created_at.slice(0, 10) : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {confirmingId === l.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs text-destructive">Delete list?</span>
                        <form action={adminDeleteList.bind(null, l.id)}>
                          <Button variant="destructive" size="sm" type="submit">Delete</Button>
                        </form>
                        <Button variant="ghost" size="sm" onClick={() => setConfirmingId(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setConfirmingId(l.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
