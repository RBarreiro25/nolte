import { GetPublicEvents, GetPublicEventsRequest, GetPublicEventsResponse } from '../../domain/usecases/get-public-events'
import { FindEventRepository } from '../protocols/event-repository'

export class DbGetPublicEvents implements GetPublicEvents {
  constructor(
    private readonly eventRepository: FindEventRepository
  ) {}

  async handle(params: GetPublicEventsRequest): Promise<GetPublicEventsResponse> {
    const page = params.page || 1
    const limit = Math.min(params.limit || 20, 100)
    
    const filters = {
      page,
      limit,
      locations: params.locations,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo
    }
    const allFilters = { ...filters, page: undefined, limit: undefined }
    const allResult = await this.eventRepository.findAll(allFilters)
    const allPublicEvents = allResult.events.filter(event => 
      event.status === 'PUBLISHED' || event.status === 'CANCELLED'
    )
    const totalPublicEvents = allPublicEvents.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedPublicEvents = allPublicEvents
      .slice(startIndex, endIndex)
      .map(event => ({
        id: event.id,
        title: event.title,
        startAt: event.startAt,
        endAt: event.endAt,
        location: event.location,
        status: event.status,
        isUpcoming: event.isUpcoming
      }))
    
    return {
      events: paginatedPublicEvents,
      total: totalPublicEvents,
      page,
      limit,
      hasMore: (page * limit) < totalPublicEvents
    }
  }
}
