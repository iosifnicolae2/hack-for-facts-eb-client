/**
 * Mapping from Romanian county auto prefix (indicativ auto) to INS SIRUTA county code.
 *
 * The SIRUTA county code ("cod judet") is the numeric identifier used by
 * Institutul National de Statistica (INS) in the SIRUTA system
 * (Sistemul Informatic al Registrului Unitatiilor Teritorial-Administrative).
 *
 * Codes 1-39 follow the original 1968 administrative reorganization (alphabetical order).
 * Code 40 = Bucuresti (Municipiul Bucuresti).
 * Codes 51, 52 = Calarasi and Giurgiu, created in 1981 from former Ilfov/Ialomita counties.
 * Code 23 = Ilfov, recreated in 1997.
 *
 * Source: INS / SIRUTA nomenclator
 */

export const COUNTY_PREFIX_TO_SIRUTA: Record<string, number> = {
  AB: 1,  // Alba
  AR: 2,  // Arad
  AG: 3,  // Arges
  BC: 4,  // Bacau
  BH: 5,  // Bihor
  BN: 6,  // Bistrita-Nasaud
  BT: 7,  // Botosani
  BV: 8,  // Brasov
  BR: 9,  // Braila
  BZ: 10, // Buzau
  CS: 11, // Caras-Severin
  CJ: 12, // Cluj
  CT: 13, // Constanta
  CV: 14, // Covasna
  DB: 15, // Dambovita
  DJ: 16, // Dolj
  GL: 17, // Galati
  GJ: 18, // Gorj
  HR: 19, // Harghita
  HD: 20, // Hunedoara
  IL: 21, // Ialomita
  IS: 22, // Iasi
  IF: 23, // Ilfov
  MM: 24, // Maramures
  MH: 25, // Mehedinti
  MS: 26, // Mures
  NT: 27, // Neamt
  OT: 28, // Olt
  PH: 29, // Prahova
  SM: 30, // Satu Mare
  SJ: 31, // Salaj
  SB: 32, // Sibiu
  SV: 33, // Suceava
  TR: 34, // Teleorman
  TM: 35, // Timis
  TL: 36, // Tulcea
  VS: 37, // Vaslui
  VL: 38, // Valcea
  VN: 39, // Vrancea
  B: 40,  // Bucuresti
  CL: 51, // Calarasi
  GR: 52, // Giurgiu
} as const;

/** Reverse lookup: SIRUTA county code -> auto prefix */
export const SIRUTA_TO_COUNTY_PREFIX: Record<number, string> = Object.fromEntries(
  Object.entries(COUNTY_PREFIX_TO_SIRUTA).map(([prefix, code]) => [code, prefix])
);

/** Type for valid county auto prefixes */
export type CountyPrefix = keyof typeof COUNTY_PREFIX_TO_SIRUTA;

/** Type for valid SIRUTA county codes */
export type SirutaCountyCode = (typeof COUNTY_PREFIX_TO_SIRUTA)[CountyPrefix];

export function resolveCountySirutaCode(
  countyCode?: string | null,
  sirutaFallback?: string | null
): string | undefined {
  const normalizedFallback = sirutaFallback?.trim();
  if (normalizedFallback && /^[0-9]+$/.test(normalizedFallback)) {
    return normalizedFallback;
  }

  const normalizedCountyCode = countyCode?.trim().toUpperCase();
  const fallbackPrefix = normalizedFallback ? normalizedFallback.toUpperCase() : undefined;
  const prefixCandidate = normalizedCountyCode || fallbackPrefix;
  if (!prefixCandidate) return undefined;

  const mapped = COUNTY_PREFIX_TO_SIRUTA[prefixCandidate];
  return mapped ? String(mapped) : undefined;
}
