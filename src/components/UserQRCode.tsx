'use client';

import { useState, useEffect } from 'react';
import { QRCode, Typography, Skeleton } from 'antd';
import { QrcodeOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface UserQRCodeProps {
  userId?: string;
  size?: number;
  title?: boolean;
  centered?: boolean;
  errorLevel?: 'L' | 'M' | 'Q' | 'H';
  checked?: boolean;
}

export default function UserQRCode({ 
  size = 200, 
  title = false, 
  centered = true,
  errorLevel = 'H',
  checked = false
}: UserQRCodeProps) {
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQrToken = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/profile/qr');
        
        if (!response.ok) {
          throw new Error('Error al generar el código QR');
        }
        
        const data = await response.json();
        setQrToken(data.qrToken);
      } catch (error) {
        console.error('Error:', error);
        setQrToken('trolleado');
        setError('No se pudo generar el código QR');
      } finally {
        setLoading(false);
      }
    };

    fetchQrToken();
  }, []);

  const containerStyle = centered 
    ? { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px' } 
    : { padding: '16px' };

  return (
    <div style={containerStyle as React.CSSProperties}>
      {title && <div style={{ marginBottom: '16px' }}><QrcodeOutlined /> Código QR</div>}
      
      {loading ? (
        <Skeleton.Avatar active size={size} shape="square" />
      ) : qrToken ? (
        <QRCode 
          value={qrToken} 
          size={size}
          errorLevel={errorLevel}
          style={{ marginBottom: 16 }}
          status={checked ? 'scanned' : undefined}
          bordered
        />
      ) : (
        <Text type="secondary">{error || 'No se pudo generar el código QR'}</Text>
      )}
    </div>
  );
} 