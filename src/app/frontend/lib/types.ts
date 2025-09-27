export interface Event {
  id: string
  title: string
  startAt: string
  endAt: string
  location: string
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED'
  isUpcoming: boolean
  internalNotes?: string
  createdBy?: string
  updatedAt: string
}

export interface PublicEvent {
  id: string
  title: string
  startAt: string
  endAt: string
  location: string
  status: 'PUBLISHED' | 'CANCELLED'
  isUpcoming: boolean
}

export interface EventSummary {
  eventId: string
  summary: string
  cacheKey: string
  generatedAt: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ErrorResponse {
  code: string
  message: string
  details?: Array<{ field: string; message: string }>
}
