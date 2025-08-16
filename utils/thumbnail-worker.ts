export class ThumbnailGenerator {
  private worker: Worker | null = null
  private cache = new Map<string, string[]>()

  constructor() {
    if (typeof Worker !== "undefined") {
      this.worker = new Worker("/workers/thumbnail-worker.js")
    }
  }

  async generateThumbnails(part: string, color: string): Promise<string[]> {
    const cacheKey = `${part}-${color}`

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    return new Promise((resolve) => {
      if (this.worker) {
        this.worker.postMessage({ part, color })
        this.worker.onmessage = (e) => {
          const thumbnails = e.data
          this.cache.set(cacheKey, thumbnails)
          resolve(thumbnails)
        }
      } else {
        // Fallback to main thread with setTimeout for non-blocking
        setTimeout(() => {
          const thumbnails = this.generateThumbnailsSync(part, color)
          this.cache.set(cacheKey, thumbnails)
          resolve(thumbnails)
        }, 0)
      }
    })
  }

  private generateThumbnailsSync(part: string, color: string): string[] {
    // Existing thumbnail generation logic
    return []
  }
}
