'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, Button, Result, Spin, Typography, Tag, Space, Alert } from 'antd';
import { CameraOutlined, QrcodeOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTheme } from '@/context/ThemeContext';
import QrScanner from 'qr-scanner';

const { Text } = Typography;

interface VerificacionQR {
  valid: boolean;
  user?: {
    nombre: string;
    id: string;
  };
  error?: string;
}

const VerificadorQR = () => {
  const [escaneando, setEscaneando] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [resultado, setResultado] = useState<VerificacionQR | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const { themeMode } = useTheme();
  const [mensajeEstado, setMensajeEstado] = useState<string>('Listo para escanear');
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

  useEffect(() => {
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

    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (escaneando && videoRef.current) {
      const startScanner = async () => {
        try {
          if (qrScannerRef.current) {
            qrScannerRef.current.destroy();
          }

          qrScannerRef.current = new QrScanner(
            videoRef.current as HTMLVideoElement,
            (result) => {
              if (result) {
                console.log("QR detectado:", result.data);
                procesarResultadoQR(result.data);
              }
            },
            {
              preferredCamera: 'environment',
              highlightScanRegion: true,
              highlightCodeOutline: true,
              maxScansPerSecond: 5,
            }
          );

          await qrScannerRef.current.start();
        } catch (err) {
          console.error("Error al iniciar el escáner:", err);
          setError("Error al iniciar el escáner de códigos QR");
          setEscaneando(false);
        }
      };

      startScanner();
    }
  }, [escaneando]);

  const iniciarEscaneo = () => {
    setEscaneando(true);
    setError(null);
    setMensajeEstado('Escaneando...');
  };

  const detenerEscaneo = async () => {
    if (qrScannerRef.current) {
      try {
        await qrScannerRef.current.stop();
        setMensajeEstado('Escaneo detenido');
        setEscaneando(false);
      } catch (err) {
        console.error("Error al detener el escáner:", err);
      }
    } else {
      setEscaneando(false);
    }
  };

  const procesarResultadoQR = async (qrToken: string) => {
    try {
      await detenerEscaneo();
      setVerificando(true);
      setMensajeEstado('Verificando código QR...');
      console.log('QR Token detectado:', qrToken);
      
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
    <Card
      style={{ 
        width: '100%',
        height: '60vh',
        margin: '0 auto',
        backgroundColor: themeMode === 'dark' ? '#1f1f1f' : '#fff',
      }}
    >
      {cameraPermission === null ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin tip="Verificando permisos de cámara..."/>
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
          <Spin tip={mensajeEstado} />
        </div>
      ) : resultado ? (
        resultado.valid ? (
          <Result
            status="success"
            title={resultado.user?.nombre}
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
              minHeight: escaneando ? '300px' : 'auto',
              border: escaneando ? '2px solid #1677ff' : '2px dashed #d9d9d9',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              position: 'relative',
              zIndex: 101
            }}
          >
            {escaneando ? (
              <video
                ref={videoRef}
                style={{
                  width: '100%',
                }}
              />
            ) : (
              <Text type="secondary" style={{ textAlign: 'center', padding: '30px' }}>
                <QrcodeOutlined style={{ fontSize: '32px', marginBottom: '8px', display: 'block' }} />
                Haz clic en &quot;Iniciar verificador&quot; para comenzar
              </Text>
            )}
          </div>
          
          {escaneando && (
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Space direction="vertical">
                <Button onClick={detenerEscaneo} type="primary" danger>Detener</Button>
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
  );
};

export default VerificadorQR;