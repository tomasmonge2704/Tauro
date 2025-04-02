'use client';

import { Layout, Button, Typography, Space, Avatar, Spin, Menu, Card } from 'antd';
import { signOut, useSession } from 'next-auth/react';
import { UserOutlined, LoadingOutlined, MenuOutlined, QrcodeOutlined, CloseOutlined } from '@ant-design/icons';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isMobile } from '@/app/utils/isMobile';
import { useState } from 'react';
import { useRoleCheck } from '@/hooks/useRoleCheck';
import { BreadCum } from './breadCum';
const { Header } = Layout;
const { Title, Text } = Typography;

interface NavBarProps {
  title?: string;
}

export const NavBar = ({ title = 'Home' }: NavBarProps) => {
  const { data: session, status } = useSession();
  const { themeMode } = useTheme();
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
          Verificador QR
        </Link>
      ),
      icon: <QrcodeOutlined />
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
          backgroundColor: themeMode === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          color: themeMode === 'dark' ? 'white' : 'black',
          position: 'fixed',
          top: '20px',
          left: isMobile() ? '20px' : '50%',
          right: isMobile() ? '20px' : '50%',
          transform: isMobile() ? 'none' : 'translateX(-50%)',
          zIndex: 1000,
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(8px)',
          margin: '0 auto',
          width: !isMobile() ? '30%' : '',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Title
              level={3}
              style={{
                color: themeMode === 'dark' ? 'white' : 'black',
                margin: 0,
              }}
            >
              {title}
            </Title>
          </Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <BreadCum />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {isAuthenticated && (
            <Button
              type="text"
              icon={menuOpen 
                ? <CloseOutlined style={{ fontSize: '20px', color: themeMode === 'dark' ? 'white' : 'black' }} />
                : <MenuOutlined style={{ fontSize: '20px', color: themeMode === 'dark' ? 'white' : 'black' }} />
              }
              onClick={() => setMenuOpen(!menuOpen)}
            />
          )}
          
          {isLoading ? (
            <Spin indicator={<LoadingOutlined style={{ fontSize: 24, color: themeMode === 'dark' ? 'white' : 'black' }} spin />} />
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
            backgroundColor: themeMode === 'dark' ? '#1f1f1f' : '#fff',
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
          <div style={{ margin: '0 auto', padding: '20px', flex: '1 0 50%' }}>
            <Menu
              mode="vertical"
              style={{ 
                fontSize: '22px', 
                backgroundColor: 'transparent',
                border: 'none',
                color: themeMode === 'dark' ? 'white' : 'black',
                textAlign: 'center'
              }}
              items={navItems}
              onClick={() => setMenuOpen(false)}
            />
          </div>
          
          <div style={{ 
            maxWidth: '600px', 
            margin: '0 auto', 
            padding: '20px', 
            borderTop: `1px solid ${themeMode === 'dark' ? '#333' : '#eee'}`,
            flex: '1 0 50%',
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
                  <Avatar size={64} icon={<UserOutlined />} src={session?.user?.image} />
                  <div style={{ textAlign: 'center' }}>
                    <Text strong style={{ fontSize: '16px', color: themeMode === 'dark' ? 'white' : 'black' }}>
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