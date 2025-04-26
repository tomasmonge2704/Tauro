'use client';

import { Layout, Typography, Space, Card, Button, Result, Spin, Alert } from 'antd';
import { QrcodeOutlined, ReloadOutlined } from '@ant-design/icons';
import VerificadorQR from './VerificadorQR';
import { useState, useEffect } from 'react';
import { useQRValidation } from '@/hooks/useQRValidation';

const { Content } = Layout;
const { Text } = Typography;

export default function VerificarQRPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const { validarQR, resultado, verificando } = useQRValidation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      validarQR(userId);
    }
  }, [userId]);
  
  return (
    <Content style={{ padding: '24px' }}>
      {userId ? (
        <Card
          style={{ 
            width: '100%',
            height: '60vh',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {verificando ? (
            <div style={{ textAlign: 'center' }}>
              <Spin tip="Verificando código QR..." size="large" />
            </div>
          ) : resultado ? (
            resultado.valid ? (
              <Result
                status="success"
                title={resultado.user?.nombre}
                subTitle="Verificado"
                extra={[
                  <Button 
                    type="primary" 
                    key="scan-again" 
                    icon={<ReloadOutlined />}
                    onClick={() => {
                      setUserId(null);
                      setError(null);
                    }}
                  >
                    Verificar otro código
                  </Button>,
                ]}
              />
            ) : (
              <Result
                status="error"
                title="QR No Válido"
                subTitle={resultado.error || 'No se pudo verificar la autenticidad del código QR'}
                extra={[
                  <Button 
                    type="primary" 
                    key="scan-again" 
                    icon={<ReloadOutlined />}
                    onClick={() => {
                      setUserId(null);
                      setError(null);
                    }}
                  >
                    Intentar de nuevo
                  </Button>,
                ]}
              />
            )
          ) : null}
        </Card>
      ) : (
        <VerificadorQR setUserId={setUserId} />
      )}

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginTop: '16px' }}
          action={
            <Button size="small" type="primary" onClick={() => setError(null)}>
              Entendido
            </Button>
          }
        />
      )}

      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <Space>
          <QrcodeOutlined style={{ fontSize: '24px' }} />
          <Text type="secondary">
            Verificador seguro para códigos QR de identificación
          </Text>
        </Space>
      </div>
    </Content>
  );
} 