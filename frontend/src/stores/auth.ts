import { defineStore } from "pinia";
import { apiRequest } from "@/lib/api";

type AuthUser = {
    id: string
    name: string
    email: string
    createdAt: string
    updatedAt: string
}

type LoginResponse = {
    ok: true
    data: {
        token: string
        user: AuthUser
    }
}

type MeResponse = {
    ok:  true
    data: AuthUser
}

const TOKEN_KEY = 'auth_token'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem(TOKEN_KEY) ?? '',
        user: null as AuthUser | null,
    }),
    getters: {
        isAuthenticated: (state) => Boolean(state.token),
    },
    actions: {
        async login (payload: { email: string; password: string}) {
            const response = await apiRequest<LoginResponse>('/auth/login', {
                method: 'POST',
                body: JSON.stringify(payload),
            })

            this.token = response.data.token
            this.user = response.data.user

            localStorage.setItem(TOKEN_KEY, response.data.token)
        },
        async fetchMe() {
            if (!this.token) return

            try {
                const response = await apiRequest<MeResponse>('/auth/me', {
                    token: this.token
                })
                this.user = response.data
            } catch {
                this.logout()
          }
        },
        logout() {
            this.token = ''
            this.user = null

            localStorage.removeItem(TOKEN_KEY)
        },
    },
})