import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/server'

interface ReminderInvite {
  id: string
  invited_email: string
  user_id: string | null
  accepted_at: string | null
  gifter: {
    email: string
    first_name: string | null
  } | null
}

interface ReminderList {
  id: string
  name: string
  slug: string
  event_date: string
  owner: {
    first_name: string | null
    last_name: string | null
    username: string
  }
  list_invites: ReminderInvite[]
}

function isoDatePlusDays(base: Date, days: number): string {
  const d = new Date(base)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

function displayName(u: { first_name: string | null; last_name: string | null; username: string }): string {
  if (u.first_name && u.last_name) return `${u.first_name} ${u.last_name}`
  if (u.first_name) return u.first_name
  return u.username
}

// Parse YYYY-MM-DD manually — new Date('YYYY-MM-DD') shifts by timezone
function formatEventDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function buildReminderHtml(params: {
  ownerName: string
  listName: string
  daysUntil: number
  listUrl: string
  appUrl: string
  eventDate: string
}): string {
  const { ownerName, listName, daysUntil, listUrl, appUrl, eventDate } = params
  const isUrgent = daysUntil === 3
  const headline = isUrgent
    ? `${ownerName}'s ${listName} is in just 3 days!`
    : `${ownerName}'s ${listName} is coming up in 2 weeks!`
  const body = isUrgent
    ? `Time is running out — make sure to pick up some items off of ${ownerName}'s list before it's too late!`
    : `You have plenty of time to pick something special. Head to the list to browse items and claim what you'd like to gift — before someone else does.`
  const ctaLabel = isUrgent ? 'View Wishlist Now' : 'View Wishlist'

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9fafb;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%);">
                  <td align="center" style="padding: 30px 20px;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Wishona</h1>
                    <p style="margin: 8px 0 0 0; color: #d1d5db; font-size: 14px;">Smart wishlists for meaningful gifts</p>
                  </td>
                </tr>

                <!-- Main content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">${headline}</p>

                    <div style="background-color: #f3f4f6; border-left: 4px solid #059669; padding: 16px; margin: 20px 0; border-radius: 4px;">
                      <p style="margin: 0; font-size: 15px;"><strong>Event date:</strong> <span style="color: #059669; font-weight: 600;">${eventDate}</span></p>
                    </div>

                    <p style="margin: 0 0 24px 0; font-size: 14px; color: #6b7280;">${body}</p>

                    <!-- CTA Button -->
                    <table cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                      <tr>
                        <td align="center" style="background-color: #059669; border-radius: 6px;">
                          <a href="${listUrl}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">${ctaLabel}</a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 24px 0 0 0; font-size: 13px; color: #9ca3af;">You're receiving this because you accepted an invite to ${ownerName}'s list on Wishona.</p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 24px 30px; border-top: 1px solid #e5e7eb; background-color: #f9fafb;">
                    <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
                      © 2026 Wishona. All rights reserved.<br />
                      <a href="${appUrl}" style="color: #059669; text-decoration: none;">Visit Wishona →</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}

export async function GET(request: Request): Promise<NextResponse> {
  const token = request.headers.get('authorization')?.slice(7)
  if (!token || token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const date14 = isoDatePlusDays(now, 14)
  const date3 = isoDatePlusDays(now, 3)

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('lists')
    .select(`
      id, name, slug, event_date,
      owner:users!lists_owner_id_fkey (first_name, last_name, username),
      list_invites (
        id, invited_email, user_id, accepted_at,
        gifter:users!list_invites_user_id_fkey (email, first_name)
      )
    `)
    .in('event_date', [date14, date3])

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const lists = (data ?? []) as unknown as ReminderList[]
  const resend = new Resend(process.env.RESEND_API_KEY)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://wishona.com'

  const results: {
    listId: string
    email: string
    status: 'sent' | 'skipped' | 'error'
    reason?: string
  }[] = []

  for (const list of lists) {
    const daysUntil = list.event_date === date14 ? 14 : 3
    const ownerName = displayName(list.owner)
    const listUrl = `${appUrl}/${list.owner.username}/${list.slug}`

    const accepted = list.list_invites.filter(
      (inv): inv is ReminderInvite & { user_id: string; accepted_at: string } =>
        inv.user_id !== null && inv.accepted_at !== null
    )

    for (const invite of accepted) {
      const toEmail = invite.gifter?.email ?? invite.invited_email

      if (process.env.NODE_ENV !== 'production') {
        results.push({ listId: list.id, email: toEmail, status: 'skipped', reason: 'dev mode' })
        continue
      }

      const { error: emailError } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: toEmail,
        subject: `Reminder: ${ownerName}'s ${list.name} is in ${daysUntil} days`,
        html: buildReminderHtml({
          ownerName,
          listName: list.name,
          daysUntil,
          listUrl,
          appUrl,
          eventDate: formatEventDate(list.event_date),
        }),
      })

      if (emailError) {
        results.push({ listId: list.id, email: toEmail, status: 'error', reason: emailError.message })
      } else {
        results.push({ listId: list.id, email: toEmail, status: 'sent' })
      }
    }
  }

  return NextResponse.json({ ok: true, results })
}
