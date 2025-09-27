import { type EventSummary } from '../models/event-model'

export interface GenerateSummaryRequest {
  eventId: string
  title: string
  location: string
  startAt: string
  endAt: string
}

export interface GenerateSummaryResponse {
  summary: EventSummary
  cached: boolean
  stream?: ReadableStream<Uint8Array>
}

export interface GenerateSummary {
  handle: (params: GenerateSummaryRequest) => Promise<GenerateSummaryResponse>
}
