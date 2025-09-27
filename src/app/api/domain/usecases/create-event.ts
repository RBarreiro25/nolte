import { type EventModel } from '../models/event-model'

export interface CreateEventRequest {
  title: string
  startAt: string
  endAt: string
  location: string
  internalNotes?: string
  createdBy?: string
}

export interface CreateEventResponse {
  event: EventModel
  success: boolean
}

export interface CreateEvent {
  handle: (params: CreateEventRequest) => Promise<CreateEventResponse>
}
