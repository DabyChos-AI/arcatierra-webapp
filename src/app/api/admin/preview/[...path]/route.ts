import { NextRequest } from 'next/server'
import { adminProxy } from '@/lib/admin-api-helper'

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const backendPath = `/api/preview/${path.join('/')}`
  return adminProxy(req, backendPath)
}

export const GET = handler
