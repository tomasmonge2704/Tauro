'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { Card, Typography, Button } from 'antd';
import { allowedRoutes } from '@/constants/routes';
import { useRoleCheck } from '@/hooks/useRoleCheck';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { isAdmin } = useRoleCheck();
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);
  
  if (status === 'loading') {
    return <div>Cargando...</div>;
  }

  const secureRoute = allowedRoutes.includes(pathname);
  if (secureRoute || isAdmin) {
    return <>{children}</>;
  }

    return <Card style={{ width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Typography.Title level={2}>Acceso Denegado</Typography.Title>
      <Typography.Paragraph>
        No tienes permisos para acceder a esta página.
      </Typography.Paragraph>
      <Button onClick={() => router.push('/login')} type="primary" 
                size="large" 
                block >Iniciar Sesión</Button>
    </Card>;
  
  
  
} 