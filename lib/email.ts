export function displayName(u: { first_name: string | null; last_name: string | null; username: string }): string {
  if (u.first_name && u.last_name) return `${u.first_name} ${u.last_name}`
  if (u.first_name) return u.first_name
  return u.username
}

export function buildAllClaimedHtml(params: {
  ownerName: string
  listName: string
  listUrl: string
  appUrl: string
}): string {
  const { ownerName, listName, listUrl, appUrl } = params
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
                    <p style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">Your wishlist is fully covered!</p>
                    <p style="margin: 0 0 24px 0; font-size: 14px; color: #6b7280;">
                      Great news, ${ownerName} — every item on your <strong>${listName}</strong> has been claimed. Your gifters have it all sorted out.
                    </p>

                    <!-- CTA Button -->
                    <table cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                      <tr>
                        <td align="center" style="background-color: #059669; border-radius: 6px;">
                          <a href="${listUrl}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">View Your Wishlist</a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 24px 0 0 0; font-size: 13px; color: #9ca3af;">You're receiving this because you own this wishlist on Wishona.</p>
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
