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
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Lists ({lists.length})</h2>
      {lists.length === 0 ? (
        <p className="text-sm text-muted-foreground">No lists.</p>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Name</th>
                <th className="text-left px-4 py-2 font-medium">Owner</th>
                <th className="text-left px-4 py-2 font-medium">Items</th>
                <th className="text-left px-4 py-2 font-medium">Created</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {lists.map(l => (
                <tr key={l.id} className="bg-card">
                  <td className="px-4 py-3 font-medium">{l.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.owner_username}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.item_count}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {l.created_at ? l.created_at.slice(0, 10) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
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
