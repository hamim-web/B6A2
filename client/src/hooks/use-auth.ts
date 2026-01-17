import { create } from 'zustand';
import { api, type authResponseSchema } from "@shared/routes";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";

type User = z.infer<typeof authResponseSchema>['user'];

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (data: z.infer<typeof authResponseSchema>) => void;
  logout: () => void;
}

// Simple store for auth state
export const useAuthStore = create<AuthState>((set) => {
  // Check local storage on init
  const storedToken = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  
  return {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken,
    isLoading: false,
    login: (data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token });
    },
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null });
    },
  };
});

export function useLogin() {
  const login = useAuthStore((state) => state.login);
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async (credentials: z.infer<typeof api.auth.signin.input>) => {
      const res = await fetch(api.auth.signin.path, {
        method: api.auth.signin.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Invalid email or password");
        throw new Error("Login failed");
      }

      const response = api.auth.signin.responses[200].parse(await res.json());
      if (!response.success || !response.data) {
          throw new Error(response.message || "Login failed");
      }
      return response.data;
    },
    onSuccess: (data) => {
      login(data);
      setLocation('/dashboard');
    },
  });
}

export function useSignup() {
    const [, setLocation] = useLocation();
    
    return useMutation({
      mutationFn: async (data: z.infer<typeof api.auth.signup.input>) => {
        const res = await fetch(api.auth.signup.path, {
          method: api.auth.signup.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
  
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || "Signup failed");
        }
  
        const response = api.auth.signup.responses[201].parse(await res.json());
        return response.data;
      },
      onSuccess: () => {
        // Automatically redirect to login
        setLocation('/login');
      },
    });
  }
