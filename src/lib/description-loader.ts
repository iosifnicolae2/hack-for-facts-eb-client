import type { ClassificationType } from '@/types/classification-explorer'

function isInvalidFileResponse(text: string): boolean {
  return (
    /^\s*<!doctype\s+html/i.test(text) ||
    /<html[\s>]/i.test(text) ||
    /^\s*<head[\s>]/i.test(text) ||
    /^\s*Cannot GET /i.test(text) ||
    /^\s*Not Found\b/i.test(text) ||
    /404 Not Found/i.test(text)
  )
}

async function tryFetchPlain(url: string): Promise<string | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const text = await res.text()
    if (isInvalidFileResponse(text)) return null
    return text
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

  return null
}

