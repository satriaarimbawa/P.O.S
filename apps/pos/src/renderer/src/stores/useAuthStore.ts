import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'CASHIER' | 'BARISTA';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  activeShift: { id: string; openedAt: string; openingCash: number } | null;
  login: (userData: User) => void;
  setActiveShift: (shift: { id: string; openedAt: string; openingCash: number } | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      activeShift: null,
      
      login: (userData: User) => {
        set({ user: userData, isAuthenticated: true });
      },
      
      setActiveShift: (activeShift) => {
        set({ activeShift });
      },
      
      logout: async () => {
        try {
          if ((window as any).posAPI?.logout) {
            await (window as any).posAPI.logout();
          }
        } catch (e) {
          console.error(e);
        }
        set({ user: null, isAuthenticated: false });
      }
    }),
    {
      name: 'kopipos-auth-session',
    }
  )
);

