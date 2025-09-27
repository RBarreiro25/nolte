import { NextRequest } from 'next/server'
import { GET, POST, PATCH } from '../[...api]/route'
import { makeEventData, authToken } from './test-helpers'

const createRequest = (method: string, url: string, body?: unknown, headers?: Record<string, string>) => {
  const fullUrl = `http://localhost:3000${url}`
  const req = new NextRequest(fullUrl, {
    method,
    headers: {
      'content-type': 'application/json',
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  })
  return req
}

describe('Events API Integration Tests', () => {

  describe('Authentication & Authorization', () => {
    test('POST /api/events should return 401 when missing authorization token', async () => {
      const eventData = makeEventData()
      const req = createRequest('POST', '/api/events', eventData)
      
      const response = await POST(req)
      const body = await response.json()
      
      expect(response.status).toBe(401)
      expect(body.error.code).toBe('UNAUTHORIZED_ERROR')
      expect(body.error.message).toBe('Unauthorized')
    })

    test('POST /api/events should return 401 when authorization token is invalid', async () => {
      const eventData = makeEventData()
      const req = createRequest('POST', '/api/events', eventData, { 'Authorization': 'Bearer invalid-token' })
      
      const response = await POST(req)
      const body = await response.json()
      
      expect(response.status).toBe(401)
      expect(body.error.code).toBe('UNAUTHORIZED_ERROR')
      expect(body.error.message).toBe('Unauthorized')
    })

    test('GET /api/events should return 401 when missing authorization token', async () => {
      const req = createRequest('GET', '/api/events')
      
      const response = await GET(req)
      const body = await response.json()
      
      expect(response.status).toBe(401)
      expect(body.error.code).toBe('UNAUTHORIZED_ERROR')
    })

    test('PATCH /api/events/:id should return 401 when missing authorization token', async () => {
      const req = createRequest('PATCH', '/api/events/some-id', { status: 'PUBLISHED' })
      
      const response = await PATCH(req)
      const body = await response.json()
      
      expect(response.status).toBe(401)
      expect(body.error.code).toBe('UNAUTHORIZED_ERROR')
    })
  })

  describe('Input Validation', () => {
    test('POST /api/events should return 400 for empty title', async () => {
      const invalidEvent = {
        ...makeEventData(),
        title: ''
      }
      const req = createRequest('POST', '/api/events', invalidEvent, { 'Authorization': authToken })
      
      const response = await POST(req)
      const body = await response.json()
      
      expect(response.status).toBe(400)
      expect(body.error.code).toBe('VALIDATION_ERROR')
      expect(body.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'title',
            message: expect.stringContaining('Too small')
          })
        ])
      )
    })

    test('POST /api/events should return 400 for past start date', async () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      
      const invalidEvent = {
        ...makeEventData(),
        startAt: pastDate.toISOString()
      }
      const req = createRequest('POST', '/api/events', invalidEvent, { 'Authorization': authToken })
      
      const response = await POST(req)
      const body = await response.json()
      
      expect(response.status).toBe(400)
      expect(body.error.code).toBe('VALIDATION_ERROR')
      expect(body.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'startAt',
            message: expect.stringContaining('Event cannot start in the past')
          })
        ])
      )
    })

    test('POST /api/events should return 400 for empty location', async () => {
      const invalidEvent = {
        ...makeEventData(),
        location: ''
      }
      const req = createRequest('POST', '/api/events', invalidEvent, { 'Authorization': authToken })
      
      const response = await POST(req)
      const body = await response.json()
      
      expect(response.status).toBe(400)
      expect(body.error.code).toBe('VALIDATION_ERROR')
      expect(body.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'location',
            message: expect.stringContaining('Too small')
          })
        ])
      )
    })

    test('POST /api/events should return 400 when startAt >= endAt', async () => {
      const now = new Date()
      const startAt = new Date(now.getTime() + 2 * 60 * 60 * 1000)
      const endAt = new Date(now.getTime() + 1 * 60 * 60 * 1000)
      
      const invalidEvent = {
        ...makeEventData(),
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString()
      }
      const req = createRequest('POST', '/api/events', invalidEvent, { 'Authorization': authToken })
      
      const response = await POST(req)
      const body = await response.json()
      
      expect(response.status).toBe(400)
      expect(body.error.code).toBe('VALIDATION_ERROR')
      expect(body.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'endAt',
            message: expect.stringContaining('End date must be after start date')
          })
        ])
      )
    })
  })

  describe('CRUD Operations', () => {
    describe('Create Events (POST)', () => {
      test('POST /api/events should create event and return 201 with full payload', async () => {
      const eventData = makeEventData()
      const req = createRequest('POST', '/api/events', eventData, { 'Authorization': authToken })
      
      const response = await POST(req)
      const body = await response.json()
      
      expect(response.status).toBe(201)
      expect(body.title).toBe(eventData.title)
      expect(body.location).toBe(eventData.location)
      expect(body.status).toBe('DRAFT')
      expect(body.id).toBeDefined()
      expect(body.createdBy).toBe('admin')
      expect(body.internalNotes).toBe(eventData.internalNotes)
      })
    })

    describe('Update Events (PATCH)', () => {
      test('PATCH /api/events/:id should update status and internalNotes only', async () => {
      const eventData = makeEventData()
      const createReq = createRequest('POST', '/api/events', eventData, { 'Authorization': authToken })
      const createResponse = await POST(createReq)
      const createdEvent = await createResponse.json()
      
      const updateData = { status: 'PUBLISHED', internalNotes: 'Updated notes' }
      const updateReq = createRequest('PATCH', `/api/events/${createdEvent.id}`, updateData, { 'Authorization': authToken })
      
      const response = await PATCH(updateReq)
      const body = await response.json()
      
      expect(response.status).toBe(200)
      expect(body.status).toBe('PUBLISHED')
      expect(body.internalNotes).toBe('Updated notes')
      expect(body.id).toBe(createdEvent.id)
      })
    })

    describe('Query Events (GET)', () => {
      test('GET /api/events should return paginated events with private fields', async () => {
        const eventData = makeEventData()
        const createReq = createRequest('POST', '/api/events', eventData, { 'Authorization': authToken })
        await POST(createReq)
        
        const req = createRequest('GET', '/api/events?page=1&limit=10', undefined, { 'Authorization': authToken })
        const response = await GET(req)
        const body = await response.json()
        
        expect(response.status).toBe(200)
        expect(body.events).toBeDefined()
        expect(body.pagination).toBeDefined()
        expect(body.pagination.page).toBe(1)
        expect(body.pagination.limit).toBe(10)
        expect(body.events[0]).toHaveProperty('internalNotes')
        expect(body.events[0]).toHaveProperty('createdBy')
      })

      test('GET /api/events should filter by dateFrom and dateTo', async () => {
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        const dayAfter = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0]
        
        const req = createRequest('GET', `/api/events?dateFrom=${tomorrow}&dateTo=${dayAfter}`, undefined, { 'Authorization': authToken })
        const response = await GET(req)
        const body = await response.json()
        
        expect(response.status).toBe(200)
        expect(body.events).toBeDefined()
      })

      test('GET /api/events should filter by locations (comma-separated)', async () => {
        const req = createRequest('GET', '/api/events?locations=New York,London', undefined, { 'Authorization': authToken })
        const response = await GET(req)
        const body = await response.json()
        
        expect(response.status).toBe(200)
        expect(body.events).toBeDefined()
      })

      test('GET /api/events should filter by status (comma-separated)', async () => {
        const req = createRequest('GET', '/api/events?status=DRAFT,PUBLISHED', undefined, { 'Authorization': authToken })
        const response = await GET(req)
        const body = await response.json()
        
        expect(response.status).toBe(200)
        expect(body.events).toBeDefined()
      })

      test('GET /api/events should enforce max limit of 100', async () => {
        const req = createRequest('GET', '/api/events?limit=150', undefined, { 'Authorization': authToken })
        const response = await GET(req)
        const body = await response.json()
        
        expect(response.status).toBe(200)
        expect(body.pagination.limit).toBe(100)
      })
    })
  })

  describe('Public API', () => {
    describe('Public Events List', () => {
      test('GET /api/public/events should return only PUBLISHED/CANCELLED without private fields', async () => {
      const eventData = makeEventData()
      const createReq = createRequest('POST', '/api/events', eventData, { 'Authorization': authToken })
      const createResponse = await POST(createReq)
      const createdEvent = await createResponse.json()
      
      const publishReq = createRequest('PATCH', `/api/events/${createdEvent.id}`, { status: 'PUBLISHED' }, { 'Authorization': authToken })
      await PATCH(publishReq)
      
      const publicReq = createRequest('GET', '/api/public/events')
      const response = await GET(publicReq)
      const body = await response.json()
      
      expect(response.status).toBe(200)
      expect(body.events).toBeDefined()
      
      const publishedEvent = body.events.find((e: { id: string }) => e.id === createdEvent.id)
      expect(publishedEvent).toBeDefined()
      expect(publishedEvent.status).toBe('PUBLISHED')
      
      expect(publishedEvent.internalNotes).toBeUndefined()
      expect(publishedEvent.createdBy).toBeUndefined()
      expect(publishedEvent.updatedAt).toBeUndefined()
      })
    })

    describe('AI Summary Streaming', () => {
      test('GET /api/public/events/:id/summary should stream summary with cache headers', async () => {
        const eventData = makeEventData()
        const createReq = createRequest('POST', '/api/events', eventData, { 'Authorization': authToken })
        const createResponse = await POST(createReq)
        const createdEvent = await createResponse.json()

        const publishReq = createRequest('PATCH', `/api/events/${createdEvent.id}`, { status: 'PUBLISHED' }, { 'Authorization': authToken })
        await PATCH(publishReq)

        const summaryReq = createRequest('GET', `/api/public/events/${createdEvent.id}/summary`)
        const response = await GET(summaryReq)
        
        expect(response.status).toBe(200)
        expect(response.headers.get('content-type')).toBe('text/event-stream')
        expect(response.headers.get('x-summary-cache')).toMatch(/^(HIT|MISS)$/)
      })

      test('GET /api/public/events/:id/summary should return 404 for non-existent event', async () => {
        const summaryReq = createRequest('GET', '/api/public/events/non-existent-id/summary')
        const response = await GET(summaryReq)
        
        expect(response.status).toBe(404)
      })

      test('GET /api/public/events/:id/summary should return 404 for DRAFT event', async () => {
        const eventData = makeEventData()
        const createReq = createRequest('POST', '/api/events', eventData, { 'Authorization': authToken })
        const createResponse = await POST(createReq)
        const createdEvent = await createResponse.json()

        const summaryReq = createRequest('GET', `/api/public/events/${createdEvent.id}/summary`)
        const response = await GET(summaryReq)
        
        expect(response.status).toBe(404)
      })
    })
  })

  describe('Business Logic', () => {
    describe('Status Transitions', () => {
      test('Should allow DRAFT → PUBLISHED transition', async () => {
        const eventData = makeEventData()
        const createReq = createRequest('POST', '/api/events', eventData, { 'Authorization': authToken })
        const createResponse = await POST(createReq)
        const createdEvent = await createResponse.json()

        const updateReq = createRequest('PATCH', `/api/events/${createdEvent.id}`, { status: 'PUBLISHED' }, { 'Authorization': authToken })
        const response = await PATCH(updateReq)
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.status).toBe('PUBLISHED')
      })

      test('Should allow DRAFT → CANCELLED transition', async () => {
        const eventData = makeEventData()
        const createReq = createRequest('POST', '/api/events', eventData, { 'Authorization': authToken })
        const createResponse = await POST(createReq)
        const createdEvent = await createResponse.json()

        const updateReq = createRequest('PATCH', `/api/events/${createdEvent.id}`, { status: 'CANCELLED' }, { 'Authorization': authToken })
        const response = await PATCH(updateReq)
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.status).toBe('CANCELLED')
      })

      test('Should allow PUBLISHED → CANCELLED transition', async () => {
        const eventData = makeEventData()
        const createReq = createRequest('POST', '/api/events', eventData, { 'Authorization': authToken })
        const createResponse = await POST(createReq)
        const createdEvent = await createResponse.json()

        const publishReq = createRequest('PATCH', `/api/events/${createdEvent.id}`, { status: 'PUBLISHED' }, { 'Authorization': authToken })
        await PATCH(publishReq)

        const cancelReq = createRequest('PATCH', `/api/events/${createdEvent.id}`, { status: 'CANCELLED' }, { 'Authorization': authToken })
        const response = await PATCH(cancelReq)
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.status).toBe('CANCELLED')
      })

      test('Should reject PUBLISHED → DRAFT transition', async () => {
        const eventData = makeEventData()
        const createReq = createRequest('POST', '/api/events', eventData, { 'Authorization': authToken })
        const createResponse = await POST(createReq)
        const createdEvent = await createResponse.json()

        const publishReq = createRequest('PATCH', `/api/events/${createdEvent.id}`, { status: 'PUBLISHED' }, { 'Authorization': authToken })
        await PATCH(publishReq)

        const revertReq = createRequest('PATCH', `/api/events/${createdEvent.id}`, { status: 'DRAFT' }, { 'Authorization': authToken })
        const response = await PATCH(revertReq)

        expect(response.status).toBe(400)
      })

      test('Should reject CANCELLED → DRAFT transition', async () => {
        const eventData = makeEventData()
        const createReq = createRequest('POST', '/api/events', eventData, { 'Authorization': authToken })
        const createResponse = await POST(createReq)
        const createdEvent = await createResponse.json()

        const cancelReq = createRequest('PATCH', `/api/events/${createdEvent.id}`, { status: 'CANCELLED' }, { 'Authorization': authToken })
        await PATCH(cancelReq)

        const revertReq = createRequest('PATCH', `/api/events/${createdEvent.id}`, { status: 'DRAFT' }, { 'Authorization': authToken })
        const response = await PATCH(revertReq)

        expect(response.status).toBe(400)
      })

      test('Should reject CANCELLED → PUBLISHED transition', async () => {
        const eventData = makeEventData()
        const createReq = createRequest('POST', '/api/events', eventData, { 'Authorization': authToken })
        const createResponse = await POST(createReq)
        const createdEvent = await createResponse.json()

        const cancelReq = createRequest('PATCH', `/api/events/${createdEvent.id}`, { status: 'CANCELLED' }, { 'Authorization': authToken })
        await PATCH(cancelReq)

        const publishReq = createRequest('PATCH', `/api/events/${createdEvent.id}`, { status: 'PUBLISHED' }, { 'Authorization': authToken })
        const response = await PATCH(publishReq)

        expect(response.status).toBe(400)
      })
    })

    describe('Security & Privacy', () => {
      test('Should never leak private fields in public endpoints', async () => {
        const eventData = makeEventData()
        const createReq = createRequest('POST', '/api/events', eventData, { 'Authorization': authToken })
        const createResponse = await POST(createReq)
        const createdEvent = await createResponse.json()

        const publishReq = createRequest('PATCH', `/api/events/${createdEvent.id}`, { status: 'PUBLISHED' }, { 'Authorization': authToken })
        await PATCH(publishReq)

        const publicReq = createRequest('GET', '/api/public/events')
        const response = await GET(publicReq)
        const body = await response.json()

        const publicEvent = body.events.find((e: { id: string }) => e.id === createdEvent.id)
        expect(publicEvent.internalNotes).toBeUndefined()
        expect(publicEvent.createdBy).toBeUndefined()
        expect(publicEvent.updatedAt).toBeUndefined()
      })

      test('Should only allow PUBLISHED and CANCELLED events in public API', async () => {
        const req = createRequest('GET', '/api/public/events')
        const response = await GET(req)
        const body = await response.json()

        expect(response.status).toBe(200)
        body.events.forEach((event: { status: string }) => {
          expect(['PUBLISHED', 'CANCELLED']).toContain(event.status)
        })
      })
    })
  })

  describe('Edge Cases', () => {
    test('Should return 404 for non-existent event update', async () => {
      const updateReq = createRequest('PATCH', '/api/events/non-existent-id', { status: 'PUBLISHED' }, { 'Authorization': authToken })
      const response = await PATCH(updateReq)

      expect(response.status).toBe(404)
    })

    test('Should reject title longer than 200 characters', async () => {
      const longTitle = 'a'.repeat(201)
      const invalidEvent = {
        ...makeEventData(),
        title: longTitle
      }
      const req = createRequest('POST', '/api/events', invalidEvent, { 'Authorization': authToken })

      const response = await POST(req)

      expect(response.status).toBe(400)
    })

    test('Should reject location longer than 500 characters', async () => {
      const longLocation = 'a'.repeat(501)
      const invalidEvent = {
        ...makeEventData(),
        location: longLocation
      }
      const req = createRequest('POST', '/api/events', invalidEvent, { 'Authorization': authToken })

      const response = await POST(req)

      expect(response.status).toBe(400)
    })

    test('Should reject PATCH with disallowed fields', async () => {
      const eventData = makeEventData()
      const createReq = createRequest('POST', '/api/events', eventData, { 'Authorization': authToken })
      const createResponse = await POST(createReq)
      const createdEvent = await createResponse.json()

      const updateReq = createRequest('PATCH', `/api/events/${createdEvent.id}`, { title: 'New Title', status: 'PUBLISHED' }, { 'Authorization': authToken })
      const response = await PATCH(updateReq)

      expect(response.status).toBe(400)
    })
  })

  describe('End-to-End Workflows', () => {
    test('E2E: Create DRAFT → Publish → Appears in public endpoint', async () => {
      const eventData = makeEventData()
      const createReq = createRequest('POST', '/api/events', eventData, { 'Authorization': authToken })
      const createResponse = await POST(createReq)
      const createdEvent = await createResponse.json()
      
      expect(createResponse.status).toBe(201)
      expect(createdEvent.status).toBe('DRAFT')
      
      const adminReq = createRequest('GET', '/api/events', undefined, { 'Authorization': authToken })
      const adminResponse = await GET(adminReq)
      const adminBody = await adminResponse.json()
      
      expect(adminResponse.status).toBe(200)
      const adminEvent = adminBody.events.find((e: { id: string }) => e.id === createdEvent.id)
      expect(adminEvent).toBeDefined()
      
      
      const publishReq = createRequest('PATCH', `/api/events/${createdEvent.id}`, { status: 'PUBLISHED' }, { 'Authorization': authToken })
      const publishResponse = await PATCH(publishReq)
      const publishedEvent = await publishResponse.json()
      
      expect(publishResponse.status).toBe(200)
      expect(publishedEvent.status).toBe('PUBLISHED')
      
      const publicReq2 = createRequest('GET', '/api/public/events')
      const publicResponse2 = await GET(publicReq2)
      const publicBody2 = await publicResponse2.json()
      
      const publishedInPublic = publicBody2.events.find((e: { id: string }) => e.id === createdEvent.id)
      expect(publishedInPublic).toBeDefined()
      expect(publishedInPublic.status).toBe('PUBLISHED')
      expect(publishedInPublic.internalNotes).toBeUndefined()
    })
  })
})
