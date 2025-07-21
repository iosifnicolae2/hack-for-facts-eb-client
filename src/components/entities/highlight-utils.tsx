import React from 'react';

export const highlightText = (
  text: string,
  query: string
): React.ReactNode => {
  if (!text || !query) return text;

  // get normalized, diacritic‑stripped match ranges
  const matches = match(text, query);
  if (matches.length === 0) return text;

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  matches.forEach(({ start, end }, idx) => {
    // push any leading non‑matched slice
    if (lastIndex < start) {
      elements.push(
        <React.Fragment key={`text-${idx}`}>
          {text.slice(lastIndex, start)}
        </React.Fragment>
      );
    }

    // push the highlighted match
    elements.push(
      <mark key={`mark-${idx}`} className="bg-yellow-300 text-black">
        {text.slice(start, end)}
      </mark>
    );

    lastIndex = end;
  });

  // push any trailing text after the last match
  if (lastIndex < text.length) {
    elements.push(
      <React.Fragment key="rest">
        {text.slice(lastIndex)}
      </React.Fragment>
    );
  }

  return <>{elements}</>;
};

export function normalizeText(input: string): string {
  return (
    input
      // decompose accents: “é” → “é”
      .normalize('NFD')
      // strip combining diacritical marks
      .replace(/[\u0300-\u036f]/g, '')
      // collapse multiple spaces
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
  );
}

// match.ts
export interface MatchRange {
  start: number; // inclusive
  end: number; // exclusive
}

/**
 * Fold diacritics and lowercase, but leave all other characters in place.
 */
function normalizeChar(ch: string): string {
  return ch
    .normalize('NFD') // decompose accents
    .replace(/[\u0300-\u036f]/g, '') // strip combining marks
    .toLowerCase();
}

/**
 * Returns all [start,end) ranges in the original `text` that match `query`,
 * after folding diacritics & lowercasing both.
 */
export function match(text: string, query: string): MatchRange[] {
  const q = query.trim();
  if (!text || !q) return [];

  // Build normalized text + a map back to original indices
  const normChars: string[] = [];
  const normToOrig: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const folded = normalizeChar(text[i]);
    // folded is almost always length 1; but we handle it generically
    for (let j = 0; j < folded.length; j++) {
      normChars.push(folded[j]);
      normToOrig.push(i);
    }
  }
  const normText = normChars.join('');
  const normQuery = q.split('').map(normalizeChar).join('');

  const ranges: MatchRange[] = [];
  let idx = normText.indexOf(normQuery, 0);
  const qLen = normQuery.length;

  while (idx !== -1) {
    // map normalized range back to original indices
    const origStart = normToOrig[idx];
    const origEnd = normToOrig[idx + qLen - 1] + 1; // +1 to make it exclusive

    ranges.push({ start: origStart, end: origEnd });

    // move past this match for the next search
    idx = normText.indexOf(normQuery, idx + qLen);
  }

  return ranges;
}
