import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        // Este es un ejemplo simple. En producción, verificarías contra una base de datos
        if (credentials?.email === "eliseolarroy@gmail.com" && credentials?.password === "tunalarompe") {
          return {
            id: "1",
            name: "Eliseo el trolo Larroy",
            email: "eliseolarroy@gmail.com",
            image: "https://i.pravatar.cc/150?u=usuario@ejemplo.com"
          };
        }
        return null;
      }
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };