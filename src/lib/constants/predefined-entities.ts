import { EntitySearchNode } from '@/schemas/entities';

export const PREDEFINED_ENTITIES: EntitySearchNode[] = [
  { cui: '4270740', name: 'Mun. Sibiu', uat: { name: 'Sibiu', county_name: 'Jud. Sibiu' } },
  { cui: '4267117', name: 'Mun. București', uat: { name: 'București', county_name: 'București' } },
  { cui: '4305857', name: 'Mun. Cluj-Napoca', uat: { name: 'Cluj-Napoca', county_name: 'Jud. Cluj' } },
  { cui: '4266456', name: 'Min. Sănătății', uat: { name: 'București', county_name: 'București' } },
  { cui: '13729380', name: 'Min. Educației', uat: { name: 'București', county_name: 'București' } },
];
