'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import type { ComponentProps, ReactNode } from 'react'

type PendingButtonProps = ComponentProps<typeof Button> & {
  pendingLabel?: ReactNode
}

export function PendingButton({ children, pendingLabel, disabled, type, ...props }: PendingButtonProps) {
  const { pending } = useFormStatus()
  return (
    <Button {...props} type={type ?? 'submit'} disabled={disabled || pending}>
      {pending && pendingLabel !== undefined ? pendingLabel : children}
    </Button>
  )
}
