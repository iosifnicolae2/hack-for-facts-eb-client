import { Normalization } from '@/schemas/charts';

export function isEuroNormalization(norm: Normalization): boolean {
  return norm === 'total_euro' || norm === 'per_capita_euro';
}


