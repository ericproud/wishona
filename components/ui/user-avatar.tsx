'use client'

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

const WARM_COLORS = [
  'bg-amber-200 text-amber-800',
  'bg-rose-200 text-rose-800',
  'bg-orange-200 text-orange-800',
  'bg-yellow-200 text-yellow-800',
  'bg-pink-200 text-pink-800',
  'bg-red-200 text-red-800',
]

function getColorClass(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return WARM_COLORS[hash % WARM_COLORS.length]
}

function getInitials(displayName: string | null, username: string): string {
  if (displayName) {
    const parts = displayName.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return displayName.slice(0, 2).toUpperCase()
  }
  return username.slice(0, 2).toUpperCase()
}

interface UserAvatarProps {
  avatarUrl: string | null
  displayName: string | null
  username: string
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

export default function UserAvatar({
  avatarUrl,
  displayName,
  username,
  size = 'default',
  className,
}: UserAvatarProps) {
  const initials = getInitials(displayName, username)
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
