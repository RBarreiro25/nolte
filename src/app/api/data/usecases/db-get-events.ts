import { GetEvents, GetEventsRequest, GetEventsResponse } from '../../domain/usecases/get-events'
import { FindEventRepository } from '../protocols/event-repository'

export class DbGetEvents implements GetEvents {
  constructor(
    private readonly eventRepository: FindEventRepository
  ) {}

  async handle(params: GetEventsRequest): Promise<GetEventsResponse> {
    const page = params.page || 1
    const limit = Math.min(params.limit || 20, 100)
    
    const filters = {
      page,
      limit,
      status: params.status,
      locations: params.locations,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo
    }
    
    const result = await this.eventRepository.findAll(filters)
    
    return {
      events: result.events,
      total: result.total,
      page,
      limit,
      hasMore: (page * limit) < result.total
    }
  }
}
