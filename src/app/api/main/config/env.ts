export const env = {
  jwtSecret: process.env.JWT_SECRET || 'nolte-challenge-secret-key-2024',
  adminToken: process.env.ADMIN_TOKEN || 'admin-token-123',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  version: process.env.VERSION || '1.0.0',
  nodeEnv: process.env.NODE_ENV || 'development'
}
