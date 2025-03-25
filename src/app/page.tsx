'use client';

import { Card, Row, Col, Statistic } from 'antd';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { UserOutlined, TeamOutlined, CalendarOutlined, QrcodeOutlined } from '@ant-design/icons';


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
    <div>
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} sm={12} md={8}>
          <Card 
            hoverable
            onClick={() => router.push(`/users/${session.user.id}`)}
          >
            <Statistic 
              title="Mi Perfil" 
              value="Ver Detalles" 
              prefix={<UserOutlined />} 
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={8}>
          <Card 
            hoverable
            onClick={() => router.push('/users')}
          >
            <Statistic 
              title="Usuarios" 
              value="Gestionar" 
              prefix={<TeamOutlined />} 
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={8}>
          <Card 
            hoverable
            onClick={() => router.push('/dashboard')}
          >
            <Statistic 
              title="Dashboard" 
              value="Ver Estadísticas" 
              prefix={<CalendarOutlined />} 
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={8}>
          <Card 
            hoverable
            onClick={() => router.push('/scan-qr')}
          >
            <Statistic 
              title="Escanear QR" 
              value="Abrir escáner" 
              prefix={<QrcodeOutlined />} 
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}