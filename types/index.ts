import type { Tables } from './supabase'

// Base table types — derived from generated Supabase types so they stay in sync with the DB.
// Regenerate with: npx supabase gen types typescript --project-id <ref> > types/supabase.ts

export type User = Tables<'users'>
export type List = Tables<'lists'>
export type Item = Tables<'items'>
export type ListInvite = Tables<'list_invites'>
export type ListInviteLink = Tables<'list_invite_links'>
export type Purchase = Tables<'purchases'>

// Profile overrides clothing_sizes with a structured type instead of the generic Json
export type Profile = Omit<Tables<'profiles'>, 'clothing_sizes'> & {
  clothing_sizes: {
    shirt?: string
    pants?: string
    shoe?: string
    dress?: string
  } | null
}

// Composed types used in UI
export interface ListWithOwner extends List {
  owner: User
}

export interface ItemWithPurchases extends Item {
  purchases: Purchase[]
}

export interface PurchaseWithGifter extends Purchase {
  gifter: Pick<User, 'id' | 'first_name' | 'last_name' | 'username'>
}

export interface ListInviteWithList extends ListInvite {
  list: List & { owner: User }
}
