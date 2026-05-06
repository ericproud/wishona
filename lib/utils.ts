import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function formatEventDate(iso: string): { relative: string; absolute: string; isPast: boolean } {
  const [y, m, d] = iso.split('-').map(Number)
  const event = new Date(y, m - 1, d)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = Math.round((event.getTime() - today.getTime()) / 86400000)
  const isPast = diffDays < 0
  const abs = Math.abs(diffDays)

  let relative: string
  if (diffDays === 0) relative = 'today'
  else if (diffDays === 1) relative = 'tomorrow'
  else if (diffDays === -1) relative = 'yesterday'
  else if (diffDays > 0 && abs < 7) relative = `in ${abs} days`
  else if (diffDays > 0 && abs < 14) relative = 'in 1 week'
  else if (diffDays > 0 && abs < 60) relative = `in ${Math.round(abs / 7)} weeks`
  else if (diffDays > 0) relative = `in ${Math.round(abs / 30)} months`
  else if (abs < 7) relative = `${abs} days ago`
  else if (abs < 14) relative = '1 week ago'
  else if (abs < 60) relative = `${Math.round(abs / 7)} weeks ago`
  else relative = `${Math.round(abs / 30)} months ago`

  const isCurrentYear = event.getFullYear() === new Date().getFullYear()
  const absolute = event.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(isCurrentYear ? {} : { year: 'numeric' }),
  })

  return { relative, absolute, isPast }
}

export function getStorageItemPath(url: string | null | undefined): string | null {
  if (!url) return null
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) return null
  const prefix = `${supabaseUrl}/storage/v1/object/public/avatars/`
  if (!url.startsWith(prefix)) return null
  const path = url.slice(prefix.length).split('?')[0]
  const segments = path.split('/')
  if (segments.length < 3 || segments[1] !== 'items') return null
  return path
}
