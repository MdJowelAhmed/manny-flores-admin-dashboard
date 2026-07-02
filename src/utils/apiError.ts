interface ApiErrorMessage {
  path?: string
  message: string
}

interface ApiErrorBody {
  success?: boolean
  message?: string
  errorMessages?: ApiErrorMessage[]
}

/**
 * Extract a user-facing message from RTK Query / fetch errors.
 * Supports backend `message` and `errorMessages[]` shapes.
 */
export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (!error || typeof error !== 'object') return fallback

  if ('data' in error && error.data && typeof error.data === 'object') {
    const data = error.data as ApiErrorBody

    if (Array.isArray(data.errorMessages) && data.errorMessages.length > 0) {
      const messages = data.errorMessages.map((entry) => entry.message).filter(Boolean)
      if (messages.length > 0) return messages.join('. ')
    }

    if (typeof data.message === 'string' && data.message.trim()) {
      return data.message
    }
  }

  if ('error' in error && typeof error.error === 'string' && error.error.trim()) {
    return error.error
  }

  if ('message' in error && typeof error.message === 'string' && error.message.trim()) {
    return error.message
  }

  return fallback
}
