'use client';

import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Typography, Button } from 'antd';
import Link from 'next/link';
import { isMobile } from '@/app/utils/isMobile';
import { useTheme } from '@/context/ThemeContext';
const { Title } = Typography;

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { themeMode } = useTheme();
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);
  
  if (status === 'loading') {
    return <div>Cargando...</div>;
  }
  
  if (!session) {
    return null;
  }
  
  return (
    <ProtectedRoute>
      <Title level={1} style={{ 
        textAlign: 'center', 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)', 
        fontSize: isMobile() ? '85px' : '180px', 
        color: themeMode === 'dark' ? 'white' : 'black',
        width: '90%',
        whiteSpace: 'nowrap',
        overflow: 'visible'
      }}>TAURO</Title>
      <div style={{
        display: isMobile() ? 'grid' : 'flex',
        justifyContent: 'center',
        left: '50%',
        transform: 'translate(-50%, 0)',
        gap: '20px',
        position: 'absolute',
        bottom: '10vh',
      }}>
        <Link href='/profile'>
          <Button type='dashed' style={{ height: '40px', width: '100%' }}>Ver Perfil</Button>
        </Link>
        <Link href='/'>
          <Button type='dashed' style={{ height: '40px', width: '100%' }}>Información del Evento</Button>
        </Link>
        <Link href='/'>
          <Button type='dashed' style={{ height: '40px', width: '100%' }}>Contacto</Button>
        </Link>
      </div>
    </ProtectedRoute>
  );
}