import { NextRequest, NextResponse } from 'next/server'
import { Controller } from '../../presentation/protocols/controller'
import { HttpRequest, HttpResponse } from '../../presentation/protocols/http'

export const adaptRoute = (controller: Controller) => {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const url = new URL(request.url)
      const params = extractParams(url.pathname)
      const query = Object.fromEntries(url.searchParams.entries())
      
      let body = {}
      if (request.method !== 'GET' && request.method !== 'DELETE') {
        try {
          body = await request.json()
        } catch {
          body = {}
        }
      }
      
      const httpRequest: HttpRequest = {
        body: { ...body, ...query },
        params,
        accountId: request.headers.get('x-user-id') || undefined,
        headers: Object.fromEntries(request.headers.entries()),
        uri: url.pathname
      }
      
      const httpResponse: HttpResponse = await controller.handle(httpRequest)
      
      if (httpResponse.statusCode > 399) {
        return NextResponse.json(
          httpResponse.body,
          { status: httpResponse.statusCode }
        )
      }
      
      if (httpResponse.type === 'stream') {
        const headers = new Headers({
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Cache-Control'
        })
        
        if (httpResponse.headers) {
          Object.entries(httpResponse.headers).forEach(([key, value]) => {
            headers.set(key, value)
          })
        }

        return new NextResponse(httpResponse.body as ReadableStream, {
          status: httpResponse.statusCode,
          headers
        })
      }
      
      const headers: Record<string, string> = {}
      if (httpResponse.headers) {
        Object.assign(headers, httpResponse.headers)
      }
      
      return NextResponse.json(httpResponse.body, { 
        status: httpResponse.statusCode,
        headers 
      })
    } catch (error) {
      console.error('Route adapter error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

function extractParams(pathname: string): Record<string, string> {
  const segments = pathname.split('/').filter(Boolean)
  const params: Record<string, string> = {}
  
  segments.forEach((segment, index) => {
    if (segments[index - 1] === 'events' && segment !== 'summary') {
      params.id = segment
    }
  })
  
  return params
}
