'use client';

import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Typography } from 'antd';
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
    </ProtectedRoute>
  );
}