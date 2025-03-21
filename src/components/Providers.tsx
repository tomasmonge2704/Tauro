'use client';

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { AntdRegistry } from '@ant-design/nextjs-registry';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <AntdRegistry>
      <ThemeProvider>
        <SessionProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </SessionProvider>
      </ThemeProvider>
    </AntdRegistry>
  );
}