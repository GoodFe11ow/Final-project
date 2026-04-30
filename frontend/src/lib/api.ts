const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

type ApiRequestOptions = RequestInit & {
    token?: string
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
        throw new Error(data.message ?? 'Request failed')
    }

    return data as T
}