export interface User {
  id: string
  email: string
  username: string
  display_name: string | null
  created_at: string
}

export interface Profile {
  user_id: string
  avatar_url: string | null
  clothing_sizes: {
    shirt?: string
    pants?: string
    shoe?: string
    dress?: string
  } | null
  interests: string | null
  wishlist_note: string | null
}

export interface List {
  id: string
  owner_id: string
  name: string
  slug: string
  is_public: boolean
  created_at: string
}

export interface Item {
  id: string
  list_id: string
  name: string
  url: string
  price: number | null
  quantity: number
  notes: string | null
  priority: number | null
  created_at: string
}

export interface ListInvite {
  id: string
  list_id: string
  invited_by: string
  invited_email: string
  token: string
  user_id: string | null
  accepted_at: string | null
  expires_at: string
  created_at: string
}

export interface Purchase {
  id: string
  item_id: string
  gifter_id: string
  purchased_at: string
}

// Composed types used in UI
export interface ListWithOwner extends List {
  owner: User
}

export interface ItemWithPurchases extends Item {
  purchases: Purchase[]
}

export interface ListInviteWithList extends ListInvite {
  list: List & { owner: User }
}
