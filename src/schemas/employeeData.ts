import { z } from 'zod'

export const sirutaCodeToCountyPrefix: Record<string, string> =
{
  "10": "AB",
  "29": "AR",
  "38": "AG",
  "47": "BC",
  "56": "BH",
  "65": "BN",
  "74": "BT",
  "92": "BR",
  "83": "BV",
  "109": "BZ",
  "519": "CL",
  "118": "CS",
  "127": "CJ",
  "136": "CT",
  "145": "CV",
  "154": "DB",
  "163": "DJ",
  "172": "GL",
  "528": "GR",
  "181": "GJ",
  "190": "HR",
  "207": "HD",
  "216": "IL",
  "225": "IS",
  "234": "IF",
  "243": "MM",
  "252": "MH",
  "261": "MS",
  "270": "NT",
  "289": "OT",
  "298": "PH",
  "314": "SJ",
  "305": "SM",
  "323": "SB",
  "332": "SV",
  "341": "TR",
  "350": "TM",
  "369": "TL",
  "387": "VL",
  "378": "VS",
  "396": "VN"
}


// Romanian CSV headers mapped to internal camelCase keys
export const employeeHeaderMap: Record<string, keyof EmployeeDataInput> = {
  'Codul SIRUTA': 'sirutaCode',
  'Denumire UAT': 'uatName',
  'Populatia UAT': 'uatPopulation',
  'Nr. max. posturi cf. pct. 1 din anexa la O.U.G nr. 63/2010': 'maxPostsFromOUG63',
  'Reducere cu 40% nr. max posturi': 'reducedMaxPosts40',
  'Reducere cu 45% nr. max posturi': 'reducedMaxPosts45',
  'Posturi pt. evidența populației': 'popRegistryPosts',
  'Posturi pt. poliţia locală': 'localPolicePosts',
  '1 post poliție la 1200 locuitori': 'onePolicePer1200Pop',
  'Posturi pt. implementare proiecte europene': 'euProjectsImplementationPosts',
  'Posturi pt. șoferi microbuze şcolare': 'schoolBusDriversPosts',
  'Posturi pt. postimplementare proiecte europene': 'euProjectsPostImplementationPosts',
  'TOTAL ACTUAL': 'totalPostsActual',
  'TOTAL CU REDUCERE 40%': 'totalPostsReduction40',
  'TOTAL CU REDUCERE 45%': 'totalPostsReduction45',
  'POSTURI OCUPATE': 'occupiedPosts',
  'Diferență reducere 40% vs. posturi ocupate': 'diff40VsOccupied',
  'Diferență reducere 45% vs. posturi ocupate': 'diff45VsOccupied',
} as const

// Input shape after mapping headers but before coercion/validation
export type EmployeeDataInput = {
  sirutaCode?: unknown
  uatName?: unknown
  uatPopulation?: unknown
  maxPostsFromOUG63?: unknown
  reducedMaxPosts40?: unknown
  reducedMaxPosts45?: unknown
  popRegistryPosts?: unknown
  localPolicePosts?: unknown
  onePolicePer1200Pop?: unknown
  euProjectsImplementationPosts?: unknown
  schoolBusDriversPosts?: unknown
  euProjectsPostImplementationPosts?: unknown
  totalPostsActual?: unknown
  totalPostsReduction40?: unknown
  totalPostsReduction45?: unknown
  occupiedPosts?: unknown
  diff40VsOccupied?: unknown
  diff45VsOccupied?: unknown
}

// Zod schema for the raw, normalized row
export const EmployeeDataSchema = z.object({
  sirutaCode: z.coerce.number(),
  uatName: z.string().min(1),
  uatPopulation: z.coerce.number().nonnegative(),
  maxPostsFromOUG63: z.coerce.number().int().nonnegative().optional().default(0),
  reducedMaxPosts40: z.coerce.number().int().nonnegative().optional().default(0),
  reducedMaxPosts45: z.coerce.number().int().nonnegative().optional().default(0),
  popRegistryPosts: z.coerce.number().int().nonnegative().optional().default(0),
  localPolicePosts: z.coerce.number().int().nonnegative().optional().default(0),
  onePolicePer1200Pop: z.coerce.number().int().nonnegative().optional().default(0),
  euProjectsImplementationPosts: z.coerce.number().int().nonnegative().optional().default(0),
  schoolBusDriversPosts: z.coerce.number().int().nonnegative().optional().default(0),
  euProjectsPostImplementationPosts: z.coerce.number().int().nonnegative().optional().default(0),
  totalPostsActual: z.coerce.number().int().nonnegative().optional().default(0),
  totalPostsReduction40: z.coerce.number().int().nonnegative().optional().default(0),
  totalPostsReduction45: z.coerce.number().int().nonnegative().optional().default(0),
  occupiedPosts: z.coerce.number().int().nonnegative().optional().default(0),
  diff40VsOccupied: z.coerce.number().int().optional().default(0),
  diff45VsOccupied: z.coerce.number().int().optional().default(0),
})

export type EmployeeData = z.infer<typeof EmployeeDataSchema>

// Enriched row with derived analytics
export const EnrichedEmployeeDataSchema = EmployeeDataSchema.extend({
  employeesPer1000Capita: z.number().nonnegative(),
})

export type EnrichedEmployeeData = z.infer<typeof EnrichedEmployeeDataSchema>

