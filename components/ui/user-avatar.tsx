'use client'

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

const AVATAR_COLORS = [
  'bg-teal-100 text-teal-700',
  'bg-violet-100 text-violet-700',
  'bg-sky-100 text-sky-700',
  'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-700',
]

function getColorClass(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

function getInitials(firstName: string | null, lastName: string | null, username: string): string {
  if (firstName && lastName) {
    return (firstName[0] + lastName[0]).toUpperCase()
  }
  if (firstName) {
    return firstName.slice(0, 2).toUpperCase()
  }
  return username.slice(0, 2).toUpperCase()
}

function getDisplayName(firstName: string | null, lastName: string | null): string | null {
  if (firstName && lastName) {
    return `${firstName} ${lastName}`
  }
  return firstName || null
}

interface UserAvatarProps {
  avatarUrl: string | null
  firstName: string | null
  lastName: string | null
  username: string
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

export default function UserAvatar({
  avatarUrl,
  firstName,
  lastName,
  username,
  size = 'default',
  className,
}: UserAvatarProps) {
  const initials = getInitials(firstName, lastName, username)
  const displayName = getDisplayName(firstName, lastName)
  const colorClass = getColorClass(username)

  return (
    <Avatar size={size} className={className}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName ?? username} />}
      <AvatarFallback className={colorClass}>
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
