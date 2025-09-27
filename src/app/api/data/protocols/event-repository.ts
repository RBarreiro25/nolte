import { EventModel } from '../../domain/models/event-model'

export interface CreateEventParams {
  title: string
  startAt: string
  endAt: string
  location: string
  status?: string
  internalNotes?: string
  createdBy?: string
}

export interface CreateEventRepository {
  create: (params: CreateEventParams) => Promise<EventModel>
}

export interface EventFilters {
  page?: number
  limit?: number
  status?: string
  locations?: string
  dateFrom?: string
  dateTo?: string
}

export interface EventQueryResult {
  events: EventModel[]
  total: number
}

export interface FindEventRepository {
  findById: (id: string) => Promise<EventModel | null>
  findAll: (filters: EventFilters) => Promise<EventQueryResult>
}

export interface UpdateEventParams {
  id: string
  status?: string
  internalNotes?: string
  updatedBy?: string
}

export interface UpdateEventRepository {
  update: (params: UpdateEventParams) => Promise<EventModel>
}
