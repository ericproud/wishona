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
