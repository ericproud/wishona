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
