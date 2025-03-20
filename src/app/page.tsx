'use client';

import { Layout, Space, Button } from 'antd';
import { NavBar } from '@/components/NavBar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';

const { Content } = Layout;

export default function Home() {
  const router = useRouter();
  const { themeMode } = useTheme();
  return (
    <ProtectedRoute>
      <Layout style={{ minHeight: '100vh', backgroundColor: themeMode === 'dark' ? '#141414' : '#f0f0f0' }}>
        <NavBar />
        
        <Content style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
            <h1>Comming Soon...</h1>
            <Button type="primary" onClick={() => router.push('/users')}>
              Ir a Usuarios
            </Button>
          </Space>
        </Content>
      </Layout>
    </ProtectedRoute>
  );
}