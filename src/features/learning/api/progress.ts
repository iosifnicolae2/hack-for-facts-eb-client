import { getAuthToken } from '@/lib/auth'
import { parseLearningGuestProgress } from '../schemas/progress'
import { parseLearningProgressEvents } from '../schemas/progress-events'
import type { LearningGuestProgress, LearningProgressEvent } from '../types'

const getApiUrl = () => import.meta.env.VITE_API_URL

type ApiResponse<T> = {
  ok: boolean
  data?: T
  error?: string
}

type LearningProgressResponse = {
  snapshot: LearningGuestProgress
  events: LearningProgressEvent[]
  cursor?: string
}

export async function fetchLearningProgress(params: { since?: string | null } = {}): Promise<LearningProgressResponse> {
  const query = params.since ? `?since=${encodeURIComponent(params.since)}` : ''
  const endpoint = `${getApiUrl()}/api/v1/learning/progress${query}`
  const token = await getAuthToken()

  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error: ApiResponse<never> = await response.json().catch(() => ({ ok: false, error: response.statusText }))
    throw new Error(error.error || `Failed to fetch learning progress: ${response.statusText}`)
  }

  const result: ApiResponse<LearningProgressResponse> = await response.json()
  if (!result.data) {
    throw new Error('No data returned from progress fetch')
  }

  return {
    snapshot: parseLearningGuestProgress(result.data.snapshot),
    events: parseLearningProgressEvents(result.data.events),
    cursor: result.data.cursor,
  }
}

export async function syncLearningProgressEvents(params: {
  events: LearningProgressEvent[]
  clientUpdatedAt: string
}): Promise<void> {
  const endpoint = `${getApiUrl()}/api/v1/learning/progress`
  const token = await getAuthToken()

  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      clientUpdatedAt: params.clientUpdatedAt,
      events: params.events,
    }),
  })

  if (!response.ok) {
    const error: ApiResponse<never> = await response.json().catch(() => ({ ok: false, error: response.statusText }))
    throw new Error(error.error || `Failed to sync learning progress: ${response.statusText}`)
  }
}
