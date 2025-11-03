/**
 * Component to highlight matching text fragments in search results
 */

type TextHighlightProps = {
  readonly text: string
  readonly search: string
  readonly className?: string
}

/**
 * Highlights matching fragments in text
 * Returns an array of text segments with highlighted parts
 */
function getHighlightedParts(text: string, search: string): Array<{ text: string; highlight: boolean }> {
  if (!search.trim()) {
    return [{ text, highlight: false }]
  }

  const parts: Array<{ text: string; highlight: boolean }> = []
  const lowerText = text.toLowerCase()
  const lowerSearch = search.toLowerCase().trim()

  let lastIndex = 0
  let index = lowerText.indexOf(lowerSearch)

  while (index !== -1) {
    // Add non-matching text before the match
    if (index > lastIndex) {
      parts.push({
        text: text.substring(lastIndex, index),
        highlight: false,
      })
    }

    // Add matching text
    parts.push({
      text: text.substring(index, index + lowerSearch.length),
      highlight: true,
    })

    lastIndex = index + lowerSearch.length
    index = lowerText.indexOf(lowerSearch, lastIndex)
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      text: text.substring(lastIndex),
      highlight: false,
    })
  }

  return parts
}

export function TextHighlight({ text, search, className = '' }: TextHighlightProps) {
  const parts = getHighlightedParts(text, search)

  return (
    <span className={className}>
      {parts.map((part, index) =>
        part.highlight ? (
          <mark
            key={index}
            className="bg-yellow-200 dark:bg-yellow-900/50 text-foreground font-semibold rounded-sm px-0.5"
          >
            {part.text}
          </mark>
        ) : (
          <span key={index}>{part.text}</span>
        )
      )}
    </span>
  )
}
