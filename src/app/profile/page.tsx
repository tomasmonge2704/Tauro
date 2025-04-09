'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, Typography, Row, Col, Spin, Alert } from 'antd';
import { MailOutlined, QrcodeOutlined } from '@ant-design/icons';
import ProtectedRoute from '@/components/ProtectedRoute';
import UserQRCode from '@/components/UserQRCode';
import { STATUS_PAID_COMPLETED } from '@/constants/options';
import StatusStepper from '@/components/StatusStepper';
import { Avatar } from '@/components/avatar';
const { Title, Text } = Typography;

interface ProfileData {
  id: string;
  nombre?: string;
  apellido?: string;
  status?: string;
  email?: string;
  role?: number;
  updated_by?: string;
  qr_scanned_at?: string;
}

export default function ProfilePage() {
  const { status } = useSession();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isQRCodeVisible, setIsQRCodeVisible] = useState(false);
  const [isQRCodeScanned, setIsQRCodeScanned] = useState(false);
  useEffect(() => {
    fetchProfileData();
  }, []);

  useEffect(() => {
    if (profileData?.status === STATUS_PAID_COMPLETED) {
      setIsQRCodeVisible(true);
    }
    if (profileData?.qr_scanned_at) {
      setIsQRCodeScanned(true);
    }
  }, [profileData]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/profile');
      
      if (!response.ok) {
        throw new Error('No se pudo obtener los datos del perfil');
      }
      
      const data = await response.json();
      setProfileData(data);
    } catch (error) {
      console.error('Error al cargar el perfil:', error);
      setError('No se pudo cargar la información del perfil');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Cargando perfil..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  return (
    <ProtectedRoute>
      <div style={{ padding: '24px' }}>        
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Card variant='outlined' style={{ textAlign: 'center', height: '100%' }}>
              <Avatar 
                nombre={profileData?.nombre || ''}
              />
              <Title level={3}>{profileData?.nombre} {profileData?.apellido}</Title>
              <Text type="secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MailOutlined style={{ marginRight: '8px' }} /> {profileData?.email || 'No disponible'}
              </Text>
              {profileData?.updated_by && <Text type="secondary" style={{ marginTop: '8px' }}>
                Te invitó: {profileData?.updated_by}
              </Text>}
            </Card>
          </Col>
          
          <Col xs={24} md={16}>
            <Card 
              title={<div><QrcodeOutlined /> Mi Código QR</div>} 
              variant='outlined'
              style={{ height: '100%' }}
            >
                {isQRCodeVisible ? (
                  <UserQRCode 
                    checked={isQRCodeScanned}
                    size={200} 
                    centered={true}
                  />
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <Typography.Text type="secondary" style={{ display: 'block', marginTop: 12 }}>
                      QR disponible después de completar el pago
                    </Typography.Text>
                  </div>
                )}
              
            </Card>
          </Col>
        </Row>
        <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
            <Col span={24}>
                <Card title="Estado del pago" variant='outlined'>
                    <StatusStepper currentStatus={profileData?.status || ''} />
                </Card>
            </Col>
        </Row>
      </div>
    </ProtectedRoute>
  );
}
