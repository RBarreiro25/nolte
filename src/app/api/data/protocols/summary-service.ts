import { EventSummary } from '../../domain/models/event-model'

export interface GenerateSummaryParams {
  eventId: string
  title: string
  location: string
  startAt: string
  endAt: string
}

export interface GenerateSummaryResult {
  summary: EventSummary
  cached: boolean
  stream?: ReadableStream<Uint8Array>
}

export interface AISummaryService {
  generateSummary: (eventId: string, title: string, location: string, startAt: string, endAt: string) => Promise<GenerateSummaryResult>
}
