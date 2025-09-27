import { HttpResponse } from '../protocols/http'
import { ErrorResponse, createUnauthorizedError, createServerError } from './error-response'

export const ok = (content: unknown, type: string = 'json'): HttpResponse => ({
  statusCode: 200,
  body: content,
  type
})

export const created = (content: unknown): HttpResponse => ({
  statusCode: 201,
  body: content,
  type: 'json'
})

export const badRequest = (error: ErrorResponse | Error): HttpResponse => ({
  statusCode: 400,
  body: error,
  type: 'json'
})

export const unauthorized = (): HttpResponse => ({
  statusCode: 401,
  body: createUnauthorizedError(),
  type: 'json'
})

export const notFound = (error: ErrorResponse | Error): HttpResponse => ({
  statusCode: 404,
  body: error,
  type: 'json'
})

export const serverError = (): HttpResponse => ({
  statusCode: 500,
  body: createServerError(),
  type: 'json'
})
