import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: number;
      nombre?: string;
      apellido?: string;
      edad?: number;
      genero?: string;
      status?: string;
      grupo?: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: number;
    nombre?: string;
    apellido?: string;
    edad?: number;
    genero?: string;
    status?: string;
    grupo?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }

  // Definición de NextAuthOptions basada en su uso en route.ts
  interface NextAuthOptions {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    providers: Array<any>;
    callbacks?: {
      jwt?: (params: { token: JWT; user: User }) => Promise<JWT>;
      session?: (params: { session: Session; token: JWT }) => Promise<Session>;
      redirect?: (params: { url: string; baseUrl: string }) => Promise<string>;
    };
    pages?: {
      signIn?: string;
      error?: string;
    };
    session?: {
      strategy?: "jwt" | "database";
      maxAge?: number;
    };
    secret?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: number;
    nombre?: string;
    apellido?: string;
    edad?: number;
    genero?: string;
    status?: string;
    grupo?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }
} 