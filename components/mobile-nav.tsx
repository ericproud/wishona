'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { signOut } from '@/lib/actions/auth'

type Props = {
  navName: string | null
}

export default function MobileNav({ navName }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="sm:hidden flex items-center justify-center w-9 h-9 -mr-2 text-white/80 hover:text-white transition-colors"
        aria-label="Open menu"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-3/4 max-w-xs p-0 flex flex-col gap-0">
          <SheetHeader className="border-b border-border">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex-1 p-4 flex flex-col gap-1">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="text-sm text-foreground hover:bg-muted rounded-md px-3 py-2.5 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/profile/edit"
              onClick={() => setOpen(false)}
              className="text-sm text-foreground hover:bg-muted rounded-md px-3 py-2.5 transition-colors"
            >
              {navName ? `Profile (${navName})` : 'Profile'}
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="w-full text-left text-sm text-destructive hover:bg-destructive/8 rounded-md px-3 py-2.5 transition-colors"
              >
                Log out
              </button>
            </form>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  )
}
