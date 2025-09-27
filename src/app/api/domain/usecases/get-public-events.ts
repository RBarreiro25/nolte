import { type PublicEventModel } from '../models/event-model'

export interface GetPublicEventsRequest {
  page?: number
  limit?: number
  locations?: string
  dateFrom?: string
  dateTo?: string
}

export interface GetPublicEventsResponse {
  events: PublicEventModel[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface GetPublicEvents {
  handle: (params: GetPublicEventsRequest) => Promise<GetPublicEventsResponse>
}