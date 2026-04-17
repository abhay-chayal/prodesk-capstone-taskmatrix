import { create } from 'zustand';
import { User } from 'firebase/auth';

interface UserState {
  user: {
    uid: string;
    email: string | null;
    name: string | null;
  } | null;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  setUser: (user) => {
    if (user) {
      set({
        user: {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
        },
        isAuthenticated: true,
        loading: false,
      });
    } else {
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },
  setLoading: (loading) => set({ loading }),
}));
