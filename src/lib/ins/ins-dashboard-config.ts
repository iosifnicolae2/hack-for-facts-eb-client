import { t } from '@lingui/core/macro';

export type InsSectionId =
  | 'core'
  | 'infrastructure'
  | 'education'
  | 'health'
  | 'culture'
  | 'agriculture'
  | 'trade'
  | 'environment'
  | 'social';

export interface InsDashboardSection {
  id: InsSectionId;
  label: string;
  description?: string;
  datasetCodes: string[];
}

export const INS_SUMMARY_METRICS = [
  { code: 'POP107D', label: t`Populație` },
  { code: 'FOM104D', label: t`Salariați (medie)` },
  { code: 'SOM101F', label: t`Rata șomajului` },
  { code: 'LOC101B', label: t`Locuințe existente` },
] as const;

export const INS_COUNTY_SUMMARY_METRICS = [
  { code: 'EXP101J', label: t`Exporturi (FOB)` },
  { code: 'EXP102J', label: t`Importuri (CIF)` },
  { code: 'ZDF1123', label: t`Sold balanță comercială` },
  { code: 'TOE1271', label: t`Spații verzi` },
] as const;

const CORE_INDICATOR_CODES = [
  'POP107D',
  'POP108C',
  'POP201D',
  'POP206D',
  'FOM104D',
  'SOM101E',
  'SOM101F',
  'LOC101B',
  'LOC104B',
  'LOC108B',
];

const INFRASTRUCTURE_CODES = [
  'GOS102A',
  'GOS103A',
  'GOS104A',
  'GOS105A',
  'GOS106B',
  'GOS108A',
  'GOS109A',
  'GOS110A',
  'GOS116A',
  'GOS118A',
  'GOS112B',
];

const EDUCATION_CODES = [
  'SCL101C',
  'SCL103D',
  'SCL104D',
  'SCL105B',
  'SCL112B',
];

const HEALTH_CODES = [
  'SAN101B',
  'SAN102C',
  'SAN104B',
  'JUS105C',
];

const CULTURE_TOURISM_CODES = [
  'ART101B',
  'ART106A',
  'ART107A',
  'ART113A',
  'TUR101C',
  'TUR104E',
  'TUR105E',
];

const AGRICULTURE_CODES = [
  'AGR101B',
  'AGR108B',
  'AGR109B',
  'AGR112B',
  'AGR115B',
  'PPA101A',
];

const COUNTY_TRADE_CODES = [
  'EXP101J',
  'EXP102J',
  'ZDF1123',
];

const COUNTY_AGRICULTURE_CODES = [
  'PPA102B',
  'TAZ0221',
  'TRH1571',
  'TRI1572',
];

const COUNTY_ENVIRONMENT_CODES = [
  'TAN0131',
  'TBD0232',
  'TOR1321',
  'TOE1271',
  'TOS1322',
];

const COUNTY_SOCIAL_CODES = [
  'TCT0345',
  'TDH0384',
];

export function buildInsDashboardSections(options: {
  includeAgriculture: boolean;
  includeCulture: boolean;
}): InsDashboardSection[] {
  const sections: InsDashboardSection[] = [
    {
      id: 'core',
      label: t`Indicatori esențiali`,
      description: t`Date de bază despre populație, muncă și locuire.`,
      datasetCodes: CORE_INDICATOR_CODES,
    },
    {
      id: 'infrastructure',
      label: t`Infrastructură & utilități`,
      description: t`Transport, drumuri și rețele locale.`,
      datasetCodes: INFRASTRUCTURE_CODES,
    },
    {
      id: 'education',
      label: t`Educație`,
      description: t`Școli, elevi și cadre didactice.`,
      datasetCodes: EDUCATION_CODES,
    },
    {
      id: 'health',
      label: t`Sănătate & social`,
      description: t`Spitale, paturi și personal medical.`,
      datasetCodes: HEALTH_CODES,
    },
  ];

  if (options.includeCulture) {
    sections.push({
      id: 'culture',
      label: t`Cultură & turism`,
      description: t`Biblioteci, muzee și activitate turistică.`,
      datasetCodes: CULTURE_TOURISM_CODES,
    });
  }

  if (options.includeAgriculture) {
    sections.push({
      id: 'agriculture',
      label: t`Agricultură`,
      description: t`Suprafețe agricole și producție.`,
      datasetCodes: AGRICULTURE_CODES,
    });
  }

  return sections;
}

export function buildInsCountyDashboardSections(): InsDashboardSection[] {
  return [
    {
      id: 'trade',
      label: t`Comerț exterior`,
      description: t`Exporturi, importuri și sold comercial.`,
      datasetCodes: COUNTY_TRADE_CODES,
    },
    {
      id: 'environment',
      label: t`Mediu & intervenții`,
      description: t`Spații verzi, intervenții IGSU și măsuri de protecție.`,
      datasetCodes: COUNTY_ENVIRONMENT_CODES,
    },
    {
      id: 'social',
      label: t`Sănătate & social`,
      description: t`Indicatori sociali și de sănătate.`,
      datasetCodes: COUNTY_SOCIAL_CODES,
    },
    {
      id: 'agriculture',
      label: t`Agricultură & terenuri`,
      description: t`Prețuri agricole și suprafețe amenajate.`,
      datasetCodes: COUNTY_AGRICULTURE_CODES,
    },
  ];
}

export function collectInsDatasetCodes(sections: InsDashboardSection[]): string[] {
  const uniqueCodes = new Set<string>();
  for (const section of sections) {
    for (const code of section.datasetCodes) {
      uniqueCodes.add(code);
    }
  }
  return Array.from(uniqueCodes);
}
