import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import { NavBarWrapper } from "@/components/NavBarWrapper";

export const metadata: Metadata = {
  title: "Tauro",
  description: "La mejor fiesta del año.",
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
          <NavBarWrapper>
            {children}
          </NavBarWrapper>
        </Providers>
      </body>
    </html>
  );
}
