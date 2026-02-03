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
  { code: 'POP107D', label: t`Population` },
  { code: 'FOM104D', label: t`Employees (average)` },
  { code: 'SOM101F', label: t`Unemployment rate` },
  { code: 'LOC101B', label: t`Existing dwellings` },
] as const;

export const INS_COUNTY_SUMMARY_METRICS = [
  { code: 'EXP101J', label: t`Exports (FOB)` },
  { code: 'EXP102J', label: t`Imports (CIF)` },
  { code: 'ZDF1123', label: t`Trade balance` },
  { code: 'TOE1271', label: t`Green spaces` },
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
      label: t`Key indicators`,
      description: t`Basic data on population, employment and housing.`,
      datasetCodes: CORE_INDICATOR_CODES,
    },
    {
      id: 'infrastructure',
      label: t`Infrastructure & utilities`,
      description: t`Transport, roads and local networks.`,
      datasetCodes: INFRASTRUCTURE_CODES,
    },
    {
      id: 'education',
      label: t`Education`,
      description: t`Schools, students and teachers.`,
      datasetCodes: EDUCATION_CODES,
    },
    {
      id: 'health',
      label: t`Health & social`,
      description: t`Hospitals, beds and medical staff.`,
      datasetCodes: HEALTH_CODES,
    },
  ];

  if (options.includeCulture) {
    sections.push({
      id: 'culture',
      label: t`Culture & tourism`,
      description: t`Libraries, museums and tourist activity.`,
      datasetCodes: CULTURE_TOURISM_CODES,
    });
  }

  if (options.includeAgriculture) {
    sections.push({
      id: 'agriculture',
      label: t`Agriculture`,
      description: t`Agricultural land and production.`,
      datasetCodes: AGRICULTURE_CODES,
    });
  }

  return sections;
}

export function buildInsCountyDashboardSections(): InsDashboardSection[] {
  return [
    {
      id: 'trade',
      label: t`Foreign trade`,
      description: t`Exports, imports and trade balance.`,
      datasetCodes: COUNTY_TRADE_CODES,
    },
    {
      id: 'environment',
      label: t`Environment & interventions`,
      description: t`Green spaces, IGSU interventions and protection measures.`,
      datasetCodes: COUNTY_ENVIRONMENT_CODES,
    },
    {
      id: 'social',
      label: t`Health & social`,
      description: t`Social and health indicators.`,
      datasetCodes: COUNTY_SOCIAL_CODES,
    },
    {
      id: 'agriculture',
      label: t`Agriculture & land`,
      description: t`Agricultural prices and developed areas.`,
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
