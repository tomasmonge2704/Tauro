'use client';

import { Layout, Space, Button } from 'antd';
import { NavBar } from '@/components/NavBar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';

const { Content } = Layout;

export default function Home() {
  const router = useRouter();

  return (
    <ProtectedRoute>
      <Layout style={{ minHeight: '100vh' }}>
        <NavBar />
        
        <Content style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Button type="primary" onClick={() => router.push('/users')}>
              Ir a Usuarios
            </Button>
          </Space>
        </Content>
      </Layout>
    </ProtectedRoute>
  );
}