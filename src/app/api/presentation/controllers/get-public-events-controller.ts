import { Controller } from '../protocols/controller'
import { HttpRequest, HttpResponse } from '../protocols/http'
import { GetPublicEvents, GetPublicEventsRequest } from '../../domain/usecases/get-public-events'
import { ok, badRequest, serverError } from '../helpers/http-helper'
import { createValidationError } from '../helpers/error-response'
import { getPublicEventsQuerySchema } from '../../infra/validators/zod-schemas'

export class GetPublicEventsController implements Controller {
  constructor(
    private readonly getPublicEvents: GetPublicEvents
  ) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const validation = getPublicEventsQuerySchema.safeParse(httpRequest.body)
      if (!validation.success) {
        const details = validation.error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
        return badRequest(createValidationError(details))
      }

      const result = await this.getPublicEvents.handle(validation.data as GetPublicEventsRequest)

      const response = {
        events: result.events,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit)
        }
      }

      return ok(response)
    } catch (error) {
      console.error('GetPublicEventsController error:', error)
      return serverError()
    }
  }
}
