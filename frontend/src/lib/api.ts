const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

type ApiRequestOptions = RequestInit & {
    token?: string
}

type ApiErrorResponse = {
    message?: string
    errors?: Record<string, string[] | undefined>
}

function extractApiErrorMessage(data: ApiErrorResponse) {
    const firstFieldError = Object.values(data.errors ?? {}).find(
        (messages) => Array.isArray(messages) && messages.length > 0,
    )?.[0]

    return firstFieldError ?? data.message ?? 'Request failed'
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}) {
    
    const { token, headers, ...rest } = options
    
    const response = await fetch(`${API_URL}${path}`, {
        ...rest,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(headers ?? {})
        },
    })
    
    const data = await response.json()

    if (!response.ok) {
        throw new Error(extractApiErrorMessage(data as ApiErrorResponse))
    }

    return data as T
}
