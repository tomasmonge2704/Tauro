'use client';

import { Layout, Button, Typography, Dropdown, Space, Avatar, Switch, Spin } from 'antd';
import { signOut, useSession } from 'next-auth/react';
import { UserOutlined, DownOutlined, BulbOutlined, BulbFilled, LoadingOutlined } from '@ant-design/icons';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const { Header } = Layout;
const { Title, Text } = Typography;

interface NavBarProps {
  title?: string;
}

export const NavBar = ({ title = 'Home' }: NavBarProps) => {
  const { data: session, status } = useSession();
  const { themeMode, toggleTheme } = useTheme();
  const router = useRouter();
  
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

  const navigationItems = {
    items: [
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
    ],
  };

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
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
        
        {isAuthenticated && (
          <Dropdown menu={navigationItems} trigger={['hover']} placement="bottomLeft">
            <a
              onClick={(e) => e.preventDefault()}
              style={{ color: themeMode === 'dark' ? 'white' : 'black' }}
            >
              <Space>
                Menú
                <DownOutlined />
              </Space>
            </a>
          </Dropdown>
        )}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
    </Header>
  );
}; 