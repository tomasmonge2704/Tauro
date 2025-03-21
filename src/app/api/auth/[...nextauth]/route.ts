import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Crear el handler con la configuración correcta
const handler = NextAuth(authOptions);

// Exportar las funciones GET y POST como funciones independientes
export const GET = handler.GET;
export const POST = handler.POST;
