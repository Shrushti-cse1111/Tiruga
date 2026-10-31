import { z } from 'zod';

export const AnonymousAuthSchema = z.object({
  name: z.string().optional(),
  lang: z.enum(['en', 'kn', 'mr']).default('en')
});

export const LoginSchema = z.object({
  phone: z.string().min(10).max(12),
  pin: z.string().length(4)
});

export const GeneratePlanSchema = z.object({
  interests: z.array(z.string()).min(1).max(6),
  days: z.number().int().min(1).max(14),
  budget: z.number().positive(),
  style: z.enum(['solo', 'family', 'romance', 'friends', 'women_group', 'senior']),
  start_city: z.string().min(2),
  start_date: z.string().min(8),
  is_woman: z.boolean(),
  karnataka_domicile: z.boolean(),
  lang: z.enum(['en', 'kn', 'mr']).default('en')
});

export const UpdateTripSchema = z.object({
  title: z.string().optional(),
  status: z.enum(['draft', 'saved', 'active', 'done']).optional(),
  start_date: z.string().optional()
});

export const ProfileFlagsSchema = z.object({
  shakti_active: z.boolean()
});

export const PlanBSimulateSchema = z.object({
  day: z.number().int().positive().default(1),
  trigger: z.enum(['rain', 'heat', 'bus_missed', 'gate_closed'])
});

export const AssistantAskSchema = z.object({
  text: z.string().min(1),
  trip_id: z.string().optional(),
  lang: z.enum(['en', 'kn', 'mr']).default('en')
});

export const EmergencyContactSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10)
});

export const DataReportSchema = z.object({
  entity: z.string(),
  entity_id: z.string(),
  note: z.string().min(5)
});
