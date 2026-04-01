import { create } from 'zustand'
import { persist } from 'zustand/middleware'
interface AuthState {
  user: {
    id: string
    name: string
    email: string
  }
  isLogin: boolean
  setUser: (user: AuthState['user']) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: {
        id: '',
        name: '',
        email: '',
      },
      isLogin: false,
      setIsLogin: (isLogin: boolean) => set({ isLogin }),
      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth',
    },
  ),
)
