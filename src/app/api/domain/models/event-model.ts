export interface EventModel {
  id: string
  title: string
  startAt: string
  endAt: string
  location: string
  status: EventStatus
  isUpcoming: boolean
  internalNotes?: string
  createdBy?: string
  updatedAt: string
}

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED'

export interface PublicEventModel {
  id: string
  title: string
  startAt: string
  endAt: string
  location: string
  status: EventStatus
  isUpcoming: boolean
}

export interface EventSummary {
  eventId: string
  summary: string
  cacheKey: string
  generatedAt: string
}
