'use client';

import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Layout, Card, Typography, Button, Alert, Spin, Space, Result } from 'antd';
import { QrcodeOutlined, ReloadOutlined, CameraOutlined } from '@ant-design/icons';
import { useTheme } from '@/context/ThemeContext';

const { Content } = Layout;
const { Text } = Typography;

export default function ScanQRPage() {
  const [data, setData] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const { themeMode } = useTheme();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-reader";

  useEffect(() => {
    // Verificar permisos de cámara al cargar el componente
    const checkCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        setCameraPermission(true);
      } catch (err) {
        console.error('Error al acceder a la cámara:', err);
        setCameraPermission(false);
        setError('No se pudo acceder a la cámara. Por favor, verifica los permisos.');
      }
    };

    checkCameraPermission();

    // Limpiar el escáner cuando el componente se desmonte
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(err => console.error('Error al detener el escáner:', err));
      }
    };
  }, []);

  const startScanner = async () => {
    try {
      setScanning(true);
      setError(null);
      
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(scannerContainerId);
      }
      
      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          setData(decodedText);
          stopScanner();
        },
        (errorMessage) => {
          // Ignorar errores durante el escaneo, solo registrarlos
          console.log(errorMessage);
        }
      );
    } catch (err) {
      console.error('Error al iniciar el escáner:', err);
      setError('Error al iniciar el escáner. Inténtalo de nuevo.');
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        setScanning(false);
      } catch (err) {
        console.error('Error al detener el escáner:', err);
      }
    }
  };

  const resetScan = () => {
    setData(null);
    startScanner();
  };

  return (
    <Content style={{ padding: '24px' }}>

      <Card
        style={{ 
          width: '100%',
          maxWidth: '500px', 
          margin: '0 auto',
          backgroundColor: themeMode === 'dark' ? '#1f1f1f' : '#fff'
        }}
      >
        {cameraPermission === null ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin tip="Verificando permisos de cámara...">
              <div style={{ height: '100px' }} />
            </Spin>
          </div>
        ) : cameraPermission === false ? (
          <Alert
            message="Permiso de cámara denegado"
            description="Para escanear códigos QR, necesitas permitir el acceso a la cámara."
            type="error"
            showIcon
          />
        ) : data ? (
          <Result
            status="success"
            title="¡Código QR escaneado!"
            subTitle={data}
            extra={[
              <Button 
                type="primary" 
                key="scan-again" 
                icon={<ReloadOutlined />}
                onClick={resetScan}
              >
                Escanear otro código
              </Button>,
            ]}
          />
        ) : (
          <div>
            {!scanning && (
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <Button 
                  type="primary" 
                  icon={<CameraOutlined />} 
                  onClick={startScanner}
                  size="large"
                >
                  Iniciar escáner
                </Button>
              </div>
            )}
            
            <div 
              id={scannerContainerId} 
              style={{ 
                width: '100%', 
                minHeight: '300px',
                border: scanning ? '2px solid #1677ff' : '2px dashed #d9d9d9',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}
            >
              {!scanning && (
                <Text type="secondary">
                  <QrcodeOutlined style={{ fontSize: '32px', marginBottom: '8px', display: 'block' }} />
                  Haz clic en &quot;Iniciar escáner&quot; para comenzar
                </Text>
              )}
            </div>
            
            {scanning && (
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <Space>
                  <Button onClick={stopScanner}>Detener</Button>
                  <Text type="secondary">
                    <CameraOutlined /> Escaneando...
                  </Text>
                </Space>
              </div>
            )}
          </div>
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
      </Card>

      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <Space>
          <QrcodeOutlined style={{ fontSize: '24px' }} />
          <Text type="secondary">
            Puedes escanear cualquier código QR estándar.
          </Text>
        </Space>
      </div>
    </Content>
  );
}
