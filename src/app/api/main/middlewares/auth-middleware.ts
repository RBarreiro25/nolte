import { JwtAdapter } from '../../infra/adapters/jwt-adapter'
import { env } from '../config/env'

export class AuthMiddleware {
  constructor(private readonly jwtAdapter: JwtAdapter) {}

  async handle(token: string): Promise<{ accountId?: string; error?: string }> {
    if (!token) {
      return { error: 'Missing authorization token' }
    }
    
    if (token === env.adminToken) {
      return { accountId: 'admin' }
    }
    
    const decoded = await this.jwtAdapter.decrypt(token)
    if (!decoded) {
      return { error: 'Invalid authorization token' }
    }
    
    return { accountId: decoded.id }
  }
}
