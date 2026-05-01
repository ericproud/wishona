'use server'

import ogs from 'open-graph-scraper'

export type ScrapedData = {
  title: string | null
  description: string | null
  image: string | null
  price: string | null
}

function isValidUrl(url: string): boolean {
  try {
    const { protocol } = new URL(url)
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}

function isAmazonUrl(url: string): boolean {
  try {
    return new URL(url).hostname.includes('amazon.')
  } catch {
    return false
  }
}

async function scrapeAmazon(url: string): Promise<ScrapedData> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    signal: AbortSignal.timeout(8000),
  })
  const html = await res.text()

  const titleMatch = html.match(/id="productTitle"[^>]*>\s*([\s\S]*?)\s*<\/span/)
  const imageMatch =
    html.match(/id="landingImage"[^>]*data-old-hires="([^"]+)"/) ??
    html.match(/id="landingImage"[^>]*src="([^"]+)"/)
  const priceMatch = html.match(/class="a-offscreen"[^>]*>\s*\$([0-9,]+\.[0-9]{2})/)

  return {
    title: titleMatch ? titleMatch[1].trim() : null,
    image: imageMatch ? imageMatch[1] : null,
    price: priceMatch ? priceMatch[1].replace(',', '') : null,
    description: null,
  }
}

export async function scrapeItemUrl(url: string): Promise<ScrapedData | null> {
  if (!isValidUrl(url)) return null

  const { result, error } = await ogs({ url, timeout: 8000 })

  const ogsData: ScrapedData = {
    title: !error && result.ogTitle ? result.ogTitle : null,
    description: !error && result.ogDescription ? result.ogDescription : null,
    image: !error && result.ogImage?.[0]?.url ? result.ogImage[0].url : null,
    price: !error && result.ogPriceAmount ? String(result.ogPriceAmount) : null,
  }

  if (isAmazonUrl(url) && !ogsData.title) {
    try {
      const amazonData = await scrapeAmazon(url)
      return {
        title: amazonData.title ?? ogsData.title,
        description: amazonData.description ?? ogsData.description,
        image: amazonData.image ?? ogsData.image,
        price: amazonData.price ?? ogsData.price,
      }
    } catch {
      // fall through to OGS data
    }
  }

  return ogsData
}
