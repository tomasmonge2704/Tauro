'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const loading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  // Extraer el usuario de la sesión
  const user = session?.user as User | null;

  // Función para iniciar sesión
  const login = async (email: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      // Redirigir a la página principal después de iniciar sesión
      router.push('/');
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      isAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // En lugar de lanzar un error, proporcionamos valores predeterminados
    console.warn('useAuth se está usando fuera de AuthProvider');
    return {
      user: null,
      loading: false,
      login: async () => { throw new Error('AuthProvider no disponible'); },
      logout: async () => { 
        await signOut({ redirect: false });
        window.location.href = '/login';
      },
      isAuthenticated: false
    };
  }
  return context;
} 