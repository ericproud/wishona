'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PendingButton } from '@/components/ui/pending-button'
import { adminDeleteUser } from '@/lib/actions/admin'

type AdminUser = {
  id: string
  username: string
  first_name: string | null
  last_name: string | null
  email: string
  created_at: string | null
  list_count: number
}

export default function AdminUsers({ users }: { users: AdminUser[] }) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  return (
    <div>
      <h2 className="text-sm font-semibold text-foreground mb-3">Users ({users.length})</h2>
      {users.length === 0 ? (
        <div className="bg-card border border-border rounded-lg px-5 py-8 text-center">
          <p className="text-sm text-muted-foreground">No users.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Username</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Lists</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Joined</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map(u => (
                <tr key={u.id}>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-foreground">{u.username}</p>
                    {(u.first_name || u.last_name) && (
                      <p className="text-xs text-muted-foreground mt-0.5">{u.first_name} {u.last_name}</p>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground text-sm">{u.email}</td>
                  <td className="px-5 py-3.5 text-muted-foreground text-sm">{u.list_count}</td>
                  <td className="px-5 py-3.5 text-muted-foreground text-sm">
                    {u.created_at ? u.created_at.slice(0, 10) : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {confirmingId === u.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs text-destructive">Delete user?</span>
                        <form action={adminDeleteUser.bind(null, u.id)}>
                          <PendingButton variant="destructive" size="sm" pendingLabel="Deleting…">
                            Delete
                          </PendingButton>
                        </form>
                        <Button variant="ghost" size="sm" onClick={() => setConfirmingId(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setConfirmingId(u.id)}
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
