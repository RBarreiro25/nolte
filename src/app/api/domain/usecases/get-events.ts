import { type EventModel } from '../models/event-model'

export interface GetEventsRequest {
  page?: number
  limit?: number
  status?: string
  locations?: string
  dateFrom?: string
  dateTo?: string
}

export interface GetEventsResponse {
  events: EventModel[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface GetEvents {
  handle: (params: GetEventsRequest) => Promise<GetEventsResponse>
}
