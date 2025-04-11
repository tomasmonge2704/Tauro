import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import type { NextAuthOptions } from "next-auth";
import { getRole } from '@/app/utils/getUserData';

const AuthOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: { email: string; password: string } | undefined) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Buscar el usuario por email
          const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', credentials.email)
            .single();
           
          if (error || !user) {
            console.error("Usuario no encontrado:", error);
            return user;
          }

          const role = await getRole(user.role);
          const isAdmin = role?.name === 'Admin';

          if (user && !isAdmin) {
            delete user.password;
            return user;
          }
        
          // Verificar si el usuario tiene contraseña
          if (!user.password) {
            console.error("Usuario sin contraseña");
            return null;
          }
          
          // Verificar la contraseña
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isPasswordValid) {
            console.error("Contraseña incorrecta");
            return null;
          }
          
          // Eliminar la contraseña del objeto usuario antes de devolverlo
          delete user.password;
          
          // Devolver el usuario completo
          return { ...user, isAdmin, roleComplete: role };
        } catch (error) {
          console.error("Error en authorize:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Pasar todos los datos del usuario al token
      if (user) {
        // Copiar todos los campos del usuario al token
        token = { ...token, ...user };
      }
      return token;
    },
    async session({ session, token }) {
      // Pasar todos los datos del token a la sesión
      if (token) {
        // Asegurarse de que session.user exista
        session.user = session.user || {};
        
        // Copiar todos los campos del token a session.user
        // excepto los campos estándar de JWT
        session.user = { ...session.user, ...token };
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      return baseUrl;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 horas
  },
  secret: process.env.NEXTAUTH_SECRET || '',
};

const handler = NextAuth(AuthOptions);

export { handler as GET, handler as POST };
