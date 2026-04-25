'use client'

import { useActionState, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateProfile, updateAvatarUrl } from '@/lib/actions/profile'
import UserAvatar from '@/components/ui/user-avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    <div className="space-y-6">
      {/* Avatar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile photo</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <UserAvatar
            avatarUrl={avatarUrl}
            displayName={user.display_name}
            username={user.username}
            size="lg"
            className="size-20 text-xl"
          />
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={avatarUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarUploading ? 'Uploading…' : 'Change photo'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            {avatarError && (
              <p className="text-sm text-destructive">{avatarError}</p>
            )}
            <p className="text-xs text-muted-foreground">JPG, PNG or WebP · max 2 MB</p>
          </div>
        </CardContent>
      </Card>

      {/* Profile fields */}
      <form action={formAction}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">About you</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {success && (
              <p className="text-sm text-green-600">Profile saved.</p>
            )}
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="display_name">Display name</Label>
              <Input
                id="display_name"
                name="display_name"
                defaultValue={user.display_name ?? ''}
                placeholder="Your full name"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="interests">Interests</Label>
              <Input
                id="interests"
                name="interests"
                defaultValue={profile?.interests ?? ''}
                placeholder="e.g. cooking, hiking, jazz records"
              />
              <p className="text-xs text-muted-foreground">
                Helps gifters pick something you&apos;ll actually like.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="wishlist_note">Wishlist note</Label>
              <Input
                id="wishlist_note"
                name="wishlist_note"
                defaultValue={profile?.wishlist_note ?? ''}
                placeholder="e.g. I prefer experiences over things"
              />
              <p className="text-xs text-muted-foreground">
                Shown at the top of your list pages.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Clothing sizes */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Clothing sizes</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="shirt">Shirt / top</Label>
              <Input
                id="shirt"
                name="shirt"
                defaultValue={sizes.shirt ?? ''}
                placeholder="M"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pants">Pants / bottoms</Label>
              <Input
                id="pants"
                name="pants"
                defaultValue={sizes.pants ?? ''}
                placeholder="32×30"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="shoe">Shoe</Label>
              <Input
                id="shoe"
                name="shoe"
                defaultValue={sizes.shoe ?? ''}
                placeholder="10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dress">Dress</Label>
              <Input
                id="dress"
                name="dress"
                defaultValue={sizes.dress ?? ''}
                placeholder="6"
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6">
          <Button type="submit" disabled={pending}>
            {pending ? 'Saving…' : 'Save profile'}
          </Button>
        </div>
      </form>
    </div>
  )
}
