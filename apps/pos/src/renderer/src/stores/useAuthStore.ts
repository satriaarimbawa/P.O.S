import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (pin: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  
  login: async (pin: string) => {
    try {
      const result = await window.posAPI.login(pin);
      if (result.success) {
        set({ user: result.user, isAuthenticated: true });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed', error);
      return false;
    }
  },
  
  logout: async () => {
    await window.posAPI.logout();
    set({ user: null, isAuthenticated: false });
  }
}));
