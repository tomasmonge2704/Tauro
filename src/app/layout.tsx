import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ThemeProvider } from "@/context/ThemeContext";

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
        <AntdRegistry>
          <ThemeProvider>
            <Providers>
              {children}
            </Providers>
          </ThemeProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
