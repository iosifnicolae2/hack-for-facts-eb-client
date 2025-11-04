import type { ClassificationType } from '@/types/classification-explorer'

function looksLikeHtml(text: string): boolean {
  return (
    /^\s*<!doctype\s+html/i.test(text) ||
    /<html[\s>]/i.test(text) ||
    /^\s*<head[\s>]/i.test(text) ||
    /^\s*Cannot GET /i.test(text)
  )
}

async function tryFetchPlain(url: string): Promise<string | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const text = await res.text()
    if (looksLikeHtml(text)) return null
    return text
  } catch {
    return null
  }
}

async function tryFetchGzip(url: string): Promise<string | null> {
  try {
    const res = await fetch(url + '.gz')
    if (!res.ok) return null

    // If server already set Content-Encoding, browser will give decompressed text
    const contentEncoding = res.headers.get('content-encoding') || ''
    if (contentEncoding.includes('gzip')) {
      const text = await res.text()
      return looksLikeHtml(text) ? null : text
    }

    // Otherwise, decompress manually
    const body = res.body
    // Prefer native DecompressionStream when available
    if (body && 'DecompressionStream' in globalThis) {
      const stream = body.pipeThrough(new DecompressionStream('gzip'))
      const buffer = await new Response(stream).arrayBuffer()
      const text = new TextDecoder().decode(buffer)
      return looksLikeHtml(text) ? null : text
    }

    // Fallback to fflate
    const ab = await res.arrayBuffer()
    const { gunzipSync, strFromU8 } = await import('fflate')
    const u8 = new Uint8Array(ab)
    const out = gunzipSync(u8)
    const text = strFromU8(out)
    return looksLikeHtml(text) ? null : text
  } catch {
    return null
  }
}

export async function loadClassificationDescription(
  locale: 'en' | 'ro',
  type: ClassificationType,
  code: string
): Promise<string | null> {
  const base = `/assets/text/${locale}/${type}/${code}.md`

  // Try plain markdown (best with server Brotli/Gzip)
  const plain = await tryFetchPlain(base)
  if (plain) return plain

  // Try precompressed gzip sidecar
  const gz = await tryFetchGzip(base)
  if (gz) return gz

  return null
}

