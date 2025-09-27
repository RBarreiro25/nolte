import { EventSummary } from '../../domain/models/event-model'
import { CacheService } from '../../data/protocols/cache-service'
import { AISummaryService, GenerateSummaryResult } from '../../data/protocols/summary-service'

export class MockAISummaryAdapter implements AISummaryService {
  constructor(private readonly cacheService: CacheService) {}

  async generateSummary(eventId: string, title: string, location: string, startAt: string, endAt: string): Promise<GenerateSummaryResult> {
    const cacheKey = this.generateCacheKey(title, location, startAt, endAt)
    const cachedSummary = await this.cacheService.get(cacheKey)

    if (cachedSummary) {
      const stream = this.createSummaryStream(cachedSummary, cacheKey, true)
      const summary: EventSummary = {
        eventId,
        summary: cachedSummary,
        cacheKey,
        generatedAt: new Date().toISOString()
      }
      return { summary, cached: true, stream }
    }

    const summaryText = this.generateMockSummary(title, location, startAt, endAt)
    const stream = this.createSummaryStream(summaryText, cacheKey, false)
    
    await this.cacheService.set(cacheKey, summaryText, 3600)

    const summary: EventSummary = {
      eventId,
      summary: summaryText,
      cacheKey,
      generatedAt: new Date().toISOString()
    }

    return { summary, cached: false, stream }
  }

  private generateCacheKey(title: string, location: string, startAt: string, endAt: string): string {
    const data = `${title}-${location}-${startAt}-${endAt}`
    return Buffer.from(data).toString('base64').slice(0, 16)
  }

  private generateMockSummary(title: string, location: string, startAt: string, endAt: string): string {
    const startDate = new Date(startAt).toLocaleDateString()
    const endDate = new Date(endAt).toLocaleDateString()
    const duration = startDate === endDate ? `on ${startDate}` : `from ${startDate} to ${endDate}`
    
    return `Join us for "${title}" taking place at ${location} ${duration}. This exciting event promises to bring together attendees for an unforgettable experience. Whether you're looking to network, learn, or simply enjoy great company, this event offers something for everyone. Mark your calendar and don't miss out on this opportunity to be part of something special.`
  }

  private createSummaryStream(text: string, cacheKey: string, cached: boolean): ReadableStream<Uint8Array> {
    const words = text.split(' ')
    let index = 0

    return new ReadableStream({
      start(controller) {
        const headers = `event: cache-info\ndata: ${JSON.stringify({ cached, cacheKey })}\n\n`
        controller.enqueue(new TextEncoder().encode(headers))

        const sendChunk = () => {
          if (index < words.length) {
            const chunkSize = Math.floor(Math.random() * 4) + 2
            const chunk = words.slice(index, index + chunkSize)
            const tokenText = index === 0 ? chunk.join(' ') : ` ${chunk.join(' ')}`
            
            const sseChunk = `event: token\ndata: ${JSON.stringify({ token: tokenText })}\n\n`
            controller.enqueue(new TextEncoder().encode(sseChunk))
            index += chunkSize
            setTimeout(sendChunk, Math.random() * 100 + 50)
          } else {
            const endEvent = `event: end\ndata: ${JSON.stringify({ complete: true })}\n\n`
            controller.enqueue(new TextEncoder().encode(endEvent))
            controller.close()
          }
        }
      
        setTimeout(sendChunk, 100)
      }
    })
  }
}
