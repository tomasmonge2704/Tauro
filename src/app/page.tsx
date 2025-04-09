'use client';

import { useSession } from 'next-auth/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from 'antd';
import { isMobile } from 'react-device-detect';
import Image from 'next/image';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
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
        <Image 
          src="/logo-verde.png" 
          alt="Logo" 
          width={isMobile ? 300 : 500}
          height={isMobile ? 300 : 500} 
          style={{ 
            position: 'absolute', 
            objectFit: 'contain',
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)'
          }} 
        />
      <div style={{
        display: isMobile ? 'grid' : 'flex',
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
        <Link href='/info'>
          <Button type='dashed' style={{ height: '40px', width: '100%' }}>Información del Evento</Button>
        </Link>
      </div>
    </ProtectedRoute>
  );
}