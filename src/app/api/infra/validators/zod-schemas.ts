import { z } from 'zod'

export const createEventSchema = z.object({
  title: z.string().min(1).max(200),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  location: z.string().min(1).max(500),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED']).optional(),
  internalNotes: z.string().optional(),
  createdBy: z.string().optional()
}).refine(data => {
  const startDate = new Date(data.startAt)
  const now = new Date()
  return startDate > now
}, {
  message: "Event cannot start in the past",
  path: ["startAt"]
}).refine(data => new Date(data.endAt) > new Date(data.startAt), {
  message: "End date must be after start date",
  path: ["endAt"]
})

export const updateEventSchema = z.object({
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED']).optional(),
  internalNotes: z.string().optional()
})

export const getEventsQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? Math.min(parseInt(val, 10), 100) : 20),
  status: z.string().optional(),
  locations: z.string().optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional()
})

export const getPublicEventsQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? Math.min(parseInt(val, 10), 100) : 20),
  locations: z.string().optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional()
})
