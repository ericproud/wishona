'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { adminDeleteUser } from '@/lib/actions/admin'

type AdminUser = {
  id: string
  username: string
  display_name: string | null
  email: string
  created_at: string | null
  list_count: number
}

export default function AdminUsers({ users }: { users: AdminUser[] }) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Users ({users.length})</h2>
      {users.length === 0 ? (
        <p className="text-sm text-muted-foreground">No users.</p>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Username</th>
                <th className="text-left px-4 py-2 font-medium">Email</th>
                <th className="text-left px-4 py-2 font-medium">Lists</th>
                <th className="text-left px-4 py-2 font-medium">Joined</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map(u => (
                <tr key={u.id} className="bg-card">
                  <td className="px-4 py-3">
                    <p className="font-medium">{u.username}</p>
                    {u.display_name && (
                      <p className="text-xs text-muted-foreground">{u.display_name}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.list_count}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {u.created_at ? u.created_at.slice(0, 10) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {confirmingId === u.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs text-destructive">Delete user?</span>
                        <form action={adminDeleteUser.bind(null, u.id)}>
                          <Button variant="destructive" size="sm" type="submit">Delete</Button>
                        </form>
                        <Button variant="ghost" size="sm" onClick={() => setConfirmingId(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
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
