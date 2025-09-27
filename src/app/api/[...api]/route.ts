import { NextRequest } from 'next/server'
import { adaptRoute } from '../main/nextjs/nextjs-route-adapter'
import { makeController } from '../main/factories/controller-factory'

export async function GET(request: NextRequest) {
  const controller = makeController('GET', request.url)
  return adaptRoute(controller)(request)
}

export async function POST(request: NextRequest) {
  const controller = makeController('POST', request.url)
  return adaptRoute(controller)(request)
}

export async function PATCH(request: NextRequest) {
  const controller = makeController('PATCH', request.url)
  return adaptRoute(controller)(request)
}
