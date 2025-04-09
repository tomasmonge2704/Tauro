import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import ProtectedRoute from "@/components/ProtectedRoute";
import { NavBarWrapper } from "@/components/NavBarWrapper";
export const metadata: Metadata = {
  title: "TAURO",
  description: "???",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <Providers>
          <ProtectedRoute>
            <NavBarWrapper>
              {children}
            </NavBarWrapper>
          </ProtectedRoute>
        </Providers>
      </body>
    </html>
  );
}
