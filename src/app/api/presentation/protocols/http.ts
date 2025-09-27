export interface HttpRequest {
  body?: Record<string, unknown>
  params?: Record<string, string>
  accountId?: string
  headers?: Record<string, string>
  uri?: string
}

export interface HttpResponse {
  statusCode: number
  body: unknown
  type?: string
  headers?: Record<string, string>
}
