import jwt from 'jsonwebtoken'

export class JwtAdapter {
  constructor(private readonly secret: string) {}

  async encrypt(value: string): Promise<string> {
    return jwt.sign({ id: value }, this.secret)
  }

  async decrypt(value: string): Promise<{ id: string } | null> {
    try {
      return jwt.verify(value, this.secret) as { id: string }
    } catch {
      return null
    }
  }
}
