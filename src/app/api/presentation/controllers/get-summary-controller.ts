import { Controller } from '../protocols/controller'
import { HttpRequest, HttpResponse } from '../protocols/http'
import { GenerateSummary } from '../../domain/usecases/generate-summary'
import { FindEventRepository } from '../../data/protocols/event-repository'
import { badRequest, notFound, serverError } from '../helpers/http-helper'
import { createValidationError, createNotFoundError } from '../helpers/error-response'

export class GetSummaryController implements Controller {
  constructor(
    private readonly generateSummary: GenerateSummary,
    private readonly findEventRepository: FindEventRepository
  ) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { id } = httpRequest.params || {}
      if (!id) {
        return badRequest(createValidationError([{ field: 'id', message: 'Event ID is required' }]))
      }

      const event = await this.findEventRepository.findById(id)
      if (!event) {
        return notFound(createNotFoundError('Event'))
      }

      if (event.status !== 'PUBLISHED' && event.status !== 'CANCELLED') {
        return notFound(createNotFoundError('Event'))
      }

      const result = await this.generateSummary.handle({
        eventId: event.id,
        title: event.title,
        location: event.location,
        startAt: event.startAt,
        endAt: event.endAt
      })

      if (result.stream) {
        return {
          statusCode: 200,
          body: result.stream,
          type: 'stream',
          headers: {
            'X-Summary-Cache': result.cached ? 'HIT' : 'MISS'
          }
        }
      }

      return {
        statusCode: 200,
        body: result.summary,
        headers: {
          'X-Summary-Cache': result.cached ? 'HIT' : 'MISS'
        }
      }
    } catch (error) {
      console.error('GetSummaryController error:', error)
      return serverError()
    }
  }
}
