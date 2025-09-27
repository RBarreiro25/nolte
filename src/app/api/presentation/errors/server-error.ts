export class ServerError extends Error {
  constructor(error: Error) {
    super(`Internal server error: ${error.stack}`)
    this.name = 'ServerError'
  }
}
