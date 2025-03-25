'use client';

import { Layout, Button, Typography, Dropdown, Space, Avatar, Switch, Spin, Drawer, Menu } from 'antd';
import { signOut, useSession } from 'next-auth/react';
import { UserOutlined, DownOutlined, BulbOutlined, BulbFilled, LoadingOutlined, ProfileOutlined, MenuOutlined, QrcodeOutlined } from '@ant-design/icons';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isMobile } from '@/app/utils/isMobile';
import { useState } from 'react';

const { Header } = Layout;
const { Title, Text } = Typography;

interface NavBarProps {
  title?: string;
}

export const NavBar = ({ title = 'Home' }: NavBarProps) => {
  const { data: session, status } = useSession();
  const { themeMode, toggleTheme } = useTheme();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  
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
    if (session?.user?.id) {
      router.push(`/users/${session.user.id}`);
    }
  };

  const menuItems = {
    items: [
      {
        key: '1',
        label: (
          <div style={{ padding: '16px', minWidth: '250px' }}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Avatar size={64} icon={<UserOutlined />} src={session?.user?.image} />
                <div>
                  <Text strong style={{ fontSize: '16px' }}>
                    {session?.user?.nombre || session?.user?.name || session?.user?.email}
                  </Text>
                  <br />
                  <Text type="secondary">{session?.user?.email}</Text>
                </div>
              </div>
              
              {session?.expires && (
                <div>
                  <Text type="secondary">Sesión expira: {new Date(session.expires).toLocaleDateString()}</Text>
                </div>
              )}

              <Button 
                type="default"
                icon={<ProfileOutlined />}
                block
                onClick={handleViewProfile}
              >
                Ver mi perfil
              </Button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>  
                <Text type="secondary">Tema</Text>
                <Switch
                  checkedChildren={<BulbFilled />}
                  unCheckedChildren={<BulbOutlined />}
                  checked={themeMode === 'dark'}
                  onChange={toggleTheme}
                />
              </div>
              
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
        ),
      },
    ],
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
      key: 'users',
      label: (
        <Link href="/users" style={{ color: 'inherit' }}>
          Usuarios
        </Link>
      ),
    },
    {
      key: 'dashboard',
      label: (
        <Link href="/dashboard" style={{ color: 'inherit' }}>
          Dashboard
        </Link>
      ),
    },
    {
      key: 'verificar-qr',
      label: (
        <Link href="/verificar-qr" style={{ color: 'inherit' }}>
          Verificador QR
        </Link>
      ),
      icon: <QrcodeOutlined />
    },
  ];

  return (
    <Header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 24px',
        backgroundColor: 'transparent',
        color: themeMode === 'dark' ? 'white' : 'black',
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
      
      {isAuthenticated && !isMobile() && (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <Menu
            mode="horizontal"
            style={{ 
              backgroundColor: 'transparent', 
              borderBottom: 'none',
              color: themeMode === 'dark' ? 'white' : 'black'
            }}
            items={navItems}
          />
        </div>
      )}
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {isAuthenticated && isMobile() && (
          <Button
            type="text"
            icon={<MenuOutlined style={{ fontSize: '20px', color: themeMode === 'dark' ? 'white' : 'black' }} />}
            onClick={() => setMenuOpen(true)}
          />
        )}
        
        {isLoading ? (
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24, color: themeMode === 'dark' ? 'white' : 'black' }} spin />} />
        ) : isAuthenticated ? (
          <Dropdown menu={menuItems} trigger={['click']} placement="bottomRight">
            <a
              onClick={(e) => e.preventDefault()}
              style={{ color: themeMode === 'dark' ? 'white' : 'black', cursor: 'pointer' }}
            >
              <Space>
                <Avatar size="small" icon={<UserOutlined />} src={session?.user?.image} />
                {session.user.nombre || session.user.name || session.user.email}
                <DownOutlined />
              </Space>
            </a>
          </Dropdown>
        ) : null}
      </div>
      
      {isAuthenticated && (
        <Drawer
          title="Menú de navegación"
          placement="right"
          onClose={() => setMenuOpen(false)}
          open={menuOpen}
          width="100%"
          bodyStyle={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            backgroundColor: themeMode === 'dark' ? '#1f1f1f' : '#fff',
            color: themeMode === 'dark' ? 'white' : 'black',
          }}
          headerStyle={{
            backgroundColor: themeMode === 'dark' ? '#1f1f1f' : '#fff',
            color: themeMode === 'dark' ? 'white' : 'black',
          }}
        >
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
        </Drawer>
      )}
    </Header>
  );
}; 