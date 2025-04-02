'use client';

import { useState, useEffect, useRef } from 'react';
import { Layout, Card, Button, Result, Spin, Typography, Tag, Space, Alert } from 'antd';
import { CameraOutlined, QrcodeOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTheme } from '@/context/ThemeContext';
import QrScanner from 'qr-scanner';

const { Content } = Layout;
const { Text } = Typography;

interface VerificacionQR {
  valid: boolean;
  error?: string;
}

export default function VerificarQRPage() {
  const [escaneando, setEscaneando] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [resultado, setResultado] = useState<VerificacionQR | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const { themeMode } = useTheme();
  const scannerRef = useRef<QrScanner | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [mensajeEstado, setMensajeEstado] = useState<string>('Listo para escanear');

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
      if (scannerRef.current) {
        scannerRef.current.stop();
      }
      scannerRef.current = null;
    };
  }, []);

  const iniciarEscaneo = async () => {
    try {
      setEscaneando(true);
      setError(null);
      setMensajeEstado('Escaneando...');

      if (!scannerRef.current && videoRef.current) {
        scannerRef.current = new QrScanner(
          videoRef.current,
          (result) => {
            console.log('QR detectado:', result);
            procesarResultadoQR(result.data);
          },
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
            preferredCamera: 'environment',
            maxScansPerSecond: 5,
          }
        );
      }

      if (scannerRef.current) {
        await scannerRef.current.start();
        console.log('Escáner iniciado correctamente');
      }
    } catch (err) {
      console.error('Error al iniciar el escáner:', err);
      setError('Error al iniciar el escáner. Inténtalo de nuevo.');
      setEscaneando(false);
      setMensajeEstado('Error al iniciar el escáner');
    }
  };

  const detenerEscaneo = async () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      setEscaneando(false);
      setMensajeEstado('Escaneo detenido');
    }
  };

  const procesarResultadoQR = async (qrToken: string) => {
    try {
      detenerEscaneo();
      setVerificando(true);
      setMensajeEstado('Verificando código QR...');
      console.log(qrToken);
      // Enviar el token al servidor para verificación
      const response = await fetch('/api/validar-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qrToken }),
      });
      
      const data: VerificacionQR = await response.json();
      setResultado(data);
      setMensajeEstado(data.valid ? 'Verificación exitosa!' : `Error: ${data.error || 'QR no válido'}`);
    } catch (error) {
      console.error('Error al verificar QR:', error);
      setResultado({
        valid: false,
        error: 'Error al procesar el código QR'
      });
      setMensajeEstado('Error al procesar el código QR');
    } finally {
      setVerificando(false);
    }
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
            description="Para verificar códigos QR, necesitas permitir el acceso a la cámara."
            type="error"
            showIcon
          />
        ) : verificando ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin tip={mensajeEstado}>
              <div style={{ height: '100px' }} />
            </Spin>
          </div>
        ) : resultado ? (
          resultado.valid ? (
            <Result
              status="success"
              title="¡QR Verificado Correctamente!"
              subTitle={mensajeEstado}
              extra={[
                <Button 
                  type="primary" 
                  key="scan-again" 
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    setResultado(null);
                    setMensajeEstado('Listo para escanear');
                  }}
                >
                  Verificar otro código
                </Button>,
              ]}
            >
            </Result>
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
                    setResultado(null);
                    setMensajeEstado('Listo para escanear');
                  }}
                >
                  Intentar de nuevo
                </Button>,
              ]}
            />
          )
        ) : (
          <div>
            {!escaneando && (
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <Button 
                  type="primary" 
                  icon={<CameraOutlined />} 
                  onClick={iniciarEscaneo}
                  size="large"
                >
                  Iniciar verificador
                </Button>
              </div>
            )}
            
            <div 
              style={{ 
                width: '100%', 
                minHeight: '50vh',
                border: escaneando ? '2px solid #1677ff' : '2px dashed #d9d9d9',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              <video 
                ref={videoRef} 
                style={{ 
                  display: escaneando ? 'block' : 'none', 
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                }} 
              />
              {!escaneando && (
                <Text type="secondary" style={{ textAlign: 'center' }}>
                  <QrcodeOutlined style={{ fontSize: '32px', marginBottom: '8px', display: 'block' }} />
                  Haz clic en &quot;Iniciar verificador&quot; para comenzar
                </Text>
              )}
            </div>
            
            {escaneando && (
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <Space direction="vertical">
                  <Button onClick={detenerEscaneo}>Detener</Button>
                  <Tag color="processing" icon={<CameraOutlined />}>
                    {mensajeEstado}
                  </Tag>
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
            Verificador seguro para códigos QR de identificación
          </Text>
        </Space>
      </div>
    </Content>
  );
} 