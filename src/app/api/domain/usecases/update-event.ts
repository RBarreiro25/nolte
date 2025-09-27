import { type EventModel, type EventStatus } from '../models/event-model'

export interface UpdateEventRequest {
  id: string
  status?: EventStatus
  internalNotes?: string
  updatedBy?: string
}

export interface UpdateEventResponse {
  event: EventModel
  success: boolean
  statusChanged: boolean
}

export interface UpdateEvent {
  handle: (params: UpdateEventRequest) => Promise<UpdateEventResponse>
}
