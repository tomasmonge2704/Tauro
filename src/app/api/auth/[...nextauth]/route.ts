import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Crear el handler con la configuración correcta
const handler = NextAuth(authOptions);

// Exportar las funciones GET y POST directamente
export { handler as GET, handler as POST };
