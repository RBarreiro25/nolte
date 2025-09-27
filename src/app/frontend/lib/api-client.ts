import { ErrorResponse } from './types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? `${window.location.origin}/api` : '/api')

interface ApiResponse<T> {
  data?: T
  error?: string | ErrorResponse
}

export class ApiClient {
  private token: string | null = null

  setToken(token: string) {
    this.token = token
  }

  clearToken() {
    this.token = null
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>
      }

      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`
      }

      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { error: errorData.error || 'Request failed' }
      }

      const data = await response.json()
      return { data }
    } catch {
      return { error: 'Network error' }
    }
  }

  async createEvent(event: {
    title: string
    startAt: string
    endAt: string
    location: string
    internalNotes?: string
  }) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(event)
    })
  }

  async updateEvent(id: string, updates: {
    status?: 'DRAFT' | 'PUBLISHED' | 'CANCELLED'
    internalNotes?: string
  }) {
    return this.request(`/events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    })
  }

  async getEvents(filters?: {
    page?: number
    limit?: number
    status?: string
    locations?: string
    dateFrom?: string
    dateTo?: string
  }) {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString())
      })
    }
    
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/events${query}`)
  }

  async getPublicEvents(filters?: {
    page?: number
    limit?: number
    locations?: string
    dateFrom?: string
    dateTo?: string
  }) {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString())
      })
    }
    
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/public/events${query}`)
  }

  async getEventSummary(id: string): Promise<EventSource> {
    const url = `${API_BASE}/public/events/${id}/summary`
    return new EventSource(url)
  }
}

export const apiClient = new ApiClient()
