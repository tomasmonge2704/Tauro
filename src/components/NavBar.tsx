'use client';

import { Layout, Button, Typography, Space, Spin, Menu, Card, Image } from 'antd';
import { signOut, useSession } from 'next-auth/react';
import { LoadingOutlined, MenuOutlined, QrcodeOutlined, CloseOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isMobile } from 'react-device-detect';
import { useState } from 'react';
import { useRoleCheck } from '@/hooks/useRoleCheck';
import { Avatar } from './avatar';

const { Header } = Layout;
const { Text } = Typography;

export const NavBar = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAdmin } = useRoleCheck();
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleViewProfile = () => {
    router.push(`/profile`);
  };

  const navItems = [
    {
      key: 'home',
      label: (
        <Link href="/" style={{ color: 'inherit' }}>
          Inicio
        </Link>
      ),
    },
    {
      key: 'info',
      label: (
        <Link href="/info" style={{ color: 'inherit' }}>
          Información
        </Link>
      ),
    },
    {
      adminOnly: true,
      key: 'users',
      label: (
        <Link href="/users" style={{ color: 'inherit' }}>
          Usuarios
        </Link>
      ),
    },
    {
      adminOnly: true,
      key: 'dashboard',
      label: (
        <Link href="/dashboard" style={{ color: 'inherit' }}>
          Dashboard
        </Link>
      ),
    },
    {
      adminOnly: true,
      key: 'verificar-qr',
      label: (
        <Link href="/verificar-qr" style={{ color: 'inherit' }}>
          Verificador
        </Link>
      ),
      icon: <QrcodeOutlined style={{ fontSize: '32px' }} />
    },
  ].filter(item => isAdmin || !item.adminOnly);
  return (
    <>
      <Header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 24px',
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          color: 'white',
          position: 'fixed',
          top: '20px',
          left: isMobile ? '24px' : '50%',
          right: isMobile ? '24px' : '50%',
          transform: isMobile ? 'none' : 'translateX(-50%)',
          zIndex: 1000,
          borderRadius: '12px',
          boxShadow: '0 8px 32px 0 #64a85517',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          border: '1px solid rgba( 255, 255, 255, 0.18 )',
          margin: '0 auto',
          width: !isMobile ? '30%' : '',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Image src="/logo-solo-verde.png" alt="Logo" width={50} height={50} preview={false} style={{ objectFit: 'contain' }} />
          </Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {isAuthenticated && (
            <Button
              type="text"
              icon={menuOpen 
                ? <CloseOutlined style={{ fontSize: '20px', color: 'white' }} />
                : <MenuOutlined style={{ fontSize: '20px', color: 'white' }} />
              }
              onClick={() => setMenuOpen(!menuOpen)}
            />
          )}
          
          {isLoading ? (
            <Spin indicator={<LoadingOutlined style={{ fontSize: 24, color: 'white' }} spin />} />
          ) : null}
        </div>
      </Header>
      
      {isAuthenticated && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(31, 31, 31, 0.8)',
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)', // Para compatibilidad con Safari
            transform: menuOpen ? 'translateY(0)' : 'translateY(-100%)',
            transition: 'transform 0.3s ease-in-out',
            zIndex: 999,
            paddingTop: '85px', // Para dejar espacio para el NavBar
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
            height: '100vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ margin: '0 auto', padding: '20px', marginTop: '80px' }}>
            <Menu
              mode="vertical"
              style={{ 
                fontSize: '40px', 
                backgroundColor: 'transparent',
                border: 'none',
                color: 'white',
                textAlign: 'center',
              }}
              items={navItems}
              onClick={() => setMenuOpen(false)}
            />
          </div>
          
          <div style={{ 
            maxWidth: isMobile ? '100vw' : '50vw', 
            margin: '0 auto', 
            padding: '20px', 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center' 
          }}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Card hoverable variant='borderless' onClick={handleViewProfile}>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  gap: '12px',
                  width: '100%' 
                }}>
                  <Avatar nombre={session?.user?.nombre || ''} />
                  <div style={{ textAlign: 'center' }}>
                    <Text strong style={{ fontSize: '16px', color: 'white' }}>
                      {session?.user?.nombre || session?.user?.name || session?.user?.email}
                    </Text>
                    <br />
                    <Text type="secondary">{session?.user?.email}</Text>
                  </div>
                </div>
              </Card>
              <Button 
                type="primary" 
                danger
                block
                onClick={handleLogout}
              >
                Cerrar Sesión
              </Button>
            </Space>
          </div>
        </div>
      )}
    </>
  );
}; 