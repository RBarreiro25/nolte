export const makeEventData = () => {
  const startAt = new Date(Date.now() + 2 * 60 * 60 * 1000)
  const endAt = new Date(startAt.getTime() + 2 * 60 * 60 * 1000)
  
  return {
    title: `Test Event ${Math.random().toString(36).substring(7)}`,
    startAt: startAt.toISOString(),
    endAt: endAt.toISOString(),
    location: `Test City ${Math.random().toString(36).substring(7)}`,
    status: 'DRAFT' as const,
    internalNotes: 'Test internal notes for this event',
    createdBy: 'test@example.com'
  }
}

export const authToken = 'Bearer admin-token-123'
