'use client'

import { useActionState, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateProfile, updateAvatarUrl } from '@/lib/actions/profile'
import UserAvatar from '@/components/ui/user-avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { User, Profile } from '@/types'

interface ProfileFormProps {
  user: User
  profile: Profile | null
}

export default function ProfileForm({ user, profile }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(updateProfile, null)
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? null)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sizes = profile?.clothing_sizes ?? {}

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('Image must be under 2 MB.')
      return
    }

    setAvatarError(null)
    setAvatarUploading(true)

    const supabase = createClient()
    const path = `${user.id}/avatar.jpg`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (uploadError) {
      setAvatarError(uploadError.message)
      setAvatarUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)

    const saveError = await updateAvatarUrl(publicUrl)
    if (saveError) {
      setAvatarError(saveError.error)
      setAvatarUploading(false)
      return
    }

    setAvatarUrl(publicUrl + `?t=${Date.now()}`)
    setAvatarUploading(false)
  }

  const success = state && 'success' in state
  const error = state && 'error' in state ? state.error : null

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Avatar */}
      <div className="bg-card border border-border rounded-lg p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Profile photo</h2>
        <div className="flex items-center gap-5">
          <UserAvatar
            avatarUrl={avatarUrl}
            firstName={user.first_name}
            lastName={user.last_name}
            username={user.username}
            size="lg"
            className="size-16 text-lg"
          />
          <div className="space-y-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={avatarUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarUploading ? 'Uploading…' : 'Change photo'}
            </Button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            {avatarError && <p className="text-xs text-destructive">{avatarError}</p>}
            <p className="text-xs text-muted-foreground">JPG, PNG or WebP · max 2 MB</p>
          </div>
        </div>
      </div>

      {/* Profile fields */}
      <form action={formAction}>
        <div className="bg-card border border-border rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">About you</h2>
          {success && (
            <div className="bg-primary/8 border border-primary/20 text-primary text-sm rounded-md px-3 py-2">
              Profile saved.
            </div>
          )}
          {error && (
            <div className="bg-destructive/8 border border-destructive/20 text-destructive text-sm rounded-md px-3 py-2">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="first_name">First name</Label>
              <Input id="first_name" name="first_name" defaultValue={user.first_name ?? ''} placeholder="Jane" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="last_name">Last name</Label>
              <Input id="last_name" name="last_name" defaultValue={user.last_name ?? ''} placeholder="Doe" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="interests">Interests</Label>
            <Input
              id="interests"
              name="interests"
              defaultValue={profile?.interests ?? ''}
              placeholder="e.g. cooking, hiking, jazz records"
            />
            <p className="text-xs text-muted-foreground">Helps gifters pick something you&apos;ll actually like.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="wishlist_note">Wishlist note</Label>
            <Input
              id="wishlist_note"
              name="wishlist_note"
              defaultValue={profile?.wishlist_note ?? ''}
              placeholder="e.g. I prefer experiences over things"
            />
            <p className="text-xs text-muted-foreground">Shown at the top of your list pages.</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-5 mt-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Clothing sizes</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="shirt">Shirt / top</Label>
              <Input id="shirt" name="shirt" defaultValue={sizes.shirt ?? ''} placeholder="M" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pants">Pants / bottoms</Label>
              <Input id="pants" name="pants" defaultValue={sizes.pants ?? ''} placeholder="32×30" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="shoe">Shoe</Label>
              <Input id="shoe" name="shoe" defaultValue={sizes.shoe ?? ''} placeholder="10" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dress">Dress</Label>
              <Input id="dress" name="dress" defaultValue={sizes.dress ?? ''} placeholder="6" />
            </div>
          </div>
        </div>

        <div className="mt-5">
          <Button type="submit" disabled={pending}>
            {pending ? 'Saving…' : 'Save profile'}
          </Button>
        </div>
      </form>
    </div>
  )
}
