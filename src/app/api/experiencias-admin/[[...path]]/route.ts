import { NextRequest } from 'next/server'
import { adminProxy } from '@/lib/admin-api-helper'

// Frontend: /api/experiencias-admin/...
// Backend:  /api/experiencias/admin/...
async function handler(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path } = await params
  const suffix = path ? `/${path.join('/')}` : ''
  const backendPath = `/api/experiencias/admin${suffix}`
  return adminProxy(req, backendPath)
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
