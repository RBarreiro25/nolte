export interface ErrorDetail {
  field: string
  message: string
}

export interface ErrorResponse {
  error: {
    code: string
    message: string
    details?: ErrorDetail[]
  }
}

export const createValidationError = (details: ErrorDetail[]): ErrorResponse => ({
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Validation failed',
    details
  }
})

export const createUnauthorizedError = (): ErrorResponse => ({
  error: {
    code: 'UNAUTHORIZED_ERROR',
    message: 'Unauthorized'
  }
})

export const createNotFoundError = (resource: string): ErrorResponse => ({
  error: {
    code: 'NOT_FOUND_ERROR',
    message: `${resource} not found`
  }
})

export const createServerError = (message: string = 'Internal server error'): ErrorResponse => ({
  error: {
    code: 'SERVER_ERROR',
    message
  }
})
