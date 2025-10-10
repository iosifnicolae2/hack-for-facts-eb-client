import { createFileRoute, Outlet } from '@tanstack/react-router';
import { z } from 'zod';
import { AlertSchema, AlertViewEnum } from '@/schemas/alerts';

const newAlertSearchSchema = z.object({
  alert: AlertSchema.optional(),
  view: AlertViewEnum.default('overview'),
  copyFrom: z.string().optional(),
  preset: AlertSchema.partial().optional(),
});

export const Route = createFileRoute('/alerts/new')({
  validateSearch: newAlertSearchSchema,
  component: Outlet,
});
