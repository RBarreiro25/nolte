import { Controller } from '../protocols/controller'
import { HttpRequest, HttpResponse } from '../protocols/http'
import { CreateEvent } from '../../domain/usecases/create-event'
import { created, badRequest, unauthorized, serverError } from '../helpers/http-helper'
import { createValidationError } from '../helpers/error-response'
import { createEventSchema } from '../../infra/validators/zod-schemas'
import { AuthMiddleware } from '../../main/middlewares/auth-middleware'

export class CreateEventController implements Controller {
  constructor(
    private readonly createEvent: CreateEvent,
    private readonly authMiddleware: AuthMiddleware
  ) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const authHeader = httpRequest.headers?.authorization?.replace('Bearer ', '') || ''
      const authResult = await this.authMiddleware.handle(authHeader)
      
      if (authResult.error) {
        return unauthorized()
      }

      const validation = createEventSchema.safeParse(httpRequest.body)
      if (!validation.success) {
        const details = validation.error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
        const errorResponse = createValidationError(details)
        return badRequest(errorResponse)
      }

      const result = await this.createEvent.handle({
        ...validation.data,
        createdBy: authResult.accountId
      })

      return created(result.event)
    } catch (error) {
      console.error('CreateEventController error:', error)
      return serverError()
    }
  }
}
