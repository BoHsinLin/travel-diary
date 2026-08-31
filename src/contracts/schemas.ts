import { z } from 'zod';
export const magicLinkSchema = z.object({ email: z.email('請輸入有效的 Email') });
export const addPlaceSchema = z.object({ dayId: z.string().min(1), startsAt: z.string().min(1), durationMinutes: z.coerce.number().int().min(15).max(720), notes: z.string().max(500).optional() });
export type MagicLinkInput = z.infer<typeof magicLinkSchema>;
export type AddPlaceInput = z.infer<typeof addPlaceSchema>;
