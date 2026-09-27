import { z } from 'zod';
import { DisasterStatus } from '@prisma/client';

export const createDisasterSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(1, 'Title cannot be empty')
    .max(255, 'Title exceeds maximum length of 255 characters'),
  description: z
    .string({ required_error: 'Description is required' })
    .trim()
    .min(1, 'Description cannot be empty'),
  location: z.string().trim().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  tags: z.array(z.string().trim()).optional().default([]),
  status: z.nativeEnum(DisasterStatus).optional().default(DisasterStatus.ACTIVE),
});

export const updateDisasterSchema = z.object({
  title: z.string().trim().min(1, 'Title cannot be empty').max(255).optional(),
  description: z.string().trim().min(1, 'Description cannot be empty').optional(),
  location: z.string().trim().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  tags: z.array(z.string().trim()).optional(),
  status: z.nativeEnum(DisasterStatus).optional(),
});

export const disasterQuerySchema = z.object({
  page: z.coerce.number().int().min(1, 'Page must be at least 1').optional().default(1),
  limit: z.coerce.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').optional().default(20),
  tag: z.string().trim().optional(),
  status: z.nativeEnum(DisasterStatus).optional(),
});

export const disasterParamsSchema = z.object({
  id: z.string().uuid('Invalid disaster ID format. Must be a valid UUID'),
});

export const resourceQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().positive('Radius must be a positive number').max(100, 'Maximum allowed radius is 100 km').optional().default(10),
});

export type CreateDisasterInput = z.infer<typeof createDisasterSchema>;
export type UpdateDisasterInput = z.infer<typeof updateDisasterSchema>;
export type DisasterQueryInput = z.infer<typeof disasterQuerySchema>;
export type DisasterParamsInput = z.infer<typeof disasterParamsSchema>;
export type ResourceQueryInput = z.infer<typeof resourceQuerySchema>;
