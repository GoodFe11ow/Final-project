const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

type ApiRequestOptions = RequestInit

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}) {
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers ?? {}),
        },
    })
    
    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.message ?? 'Request failed')
    }

    return data as T
}