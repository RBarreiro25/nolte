import { GenerateSummary, GenerateSummaryRequest, GenerateSummaryResponse } from '../../domain/usecases/generate-summary'
import { AISummaryService } from '../protocols/summary-service'

export class DbGenerateSummary implements GenerateSummary {
  constructor(private readonly aiSummaryService: AISummaryService) {}

  async handle(params: GenerateSummaryRequest): Promise<GenerateSummaryResponse> {
    const result = await this.aiSummaryService.generateSummary(
      params.eventId,
      params.title,
      params.location,
      params.startAt,
      params.endAt
    )

    return {
      summary: result.summary,
      cached: result.cached,
      stream: result.stream
    }
  }
}
