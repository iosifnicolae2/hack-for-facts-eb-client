const REPLACEMENTS: Array<[RegExp, string]> = [
  [/ /g, "%20"],
  [/\+/g, "%20"],
  [/%21/gi, "!"],
  [/%28/gi, "("],
  [/%29/gi, ")"],
  [/%7e/gi, "~"],
];

export const normalizeSearchEncoding = (search: string): string => {
  if (!search) return search;

  return REPLACEMENTS.reduce(
    (value, [pattern, replacement]) => value.replace(pattern, replacement),
    search,
  );
};

export const parseSearchParamJson = (value: unknown): unknown => {
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  if (!trimmed) return value;

  try {
    return JSON.parse(trimmed);
  } catch {
    // Fallback for encoded JSON values
  }

  try {
    const normalized = trimmed.replace(/\+/g, "%20");
    return JSON.parse(decodeURIComponent(normalized));
  } catch {
    return value;
  }
};

export const normalizeHrefSearch = (href: string): string => {
  if (!href) return href;

  const hashIndex = href.indexOf("#");
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : "";
  const withoutHash = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const searchIndex = withoutHash.indexOf("?");

  if (searchIndex < 0) return href;

  const path = withoutHash.slice(0, searchIndex);
  const search = withoutHash.slice(searchIndex);
  const normalizedSearch = normalizeSearchEncoding(search);

  return `${path}${normalizedSearch}${hash}`;
};
