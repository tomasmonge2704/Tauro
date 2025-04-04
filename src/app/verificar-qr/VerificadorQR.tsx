'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, Button, Result, Spin, Typography, Tag, Space, Alert } from 'antd';
import { CameraOutlined, QrcodeOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTheme } from '@/context/ThemeContext';
import { Html5Qrcode } from 'html5-qrcode';

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
  const qrScannerRef = useRef<Html5Qrcode | null>(null);
  const scannerDivId = 'qr-reader';

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

    // Limpiar el scanner cuando el componente se desmonte
    return () => {
      if (qrScannerRef.current && qrScannerRef.current.isScanning) {
        qrScannerRef.current.stop().catch(err => console.error("Error al detener el escáner:", err));
      }
    };
  }, []);

  // Efecto para iniciar el escáner cuando el componente esté listo
  useEffect(() => {
    if (escaneando) {
      const startScanner = async () => {
        try {
          // Aseguramos que el div existe antes de inicializar el escáner
          if (document.getElementById(scannerDivId)) {
            qrScannerRef.current = new Html5Qrcode(scannerDivId);
            const cameras = await Html5Qrcode.getCameras();
            
            if (cameras && cameras.length > 0) {
              const cameraId = cameras[0].id;
              
              await qrScannerRef.current.start(
                cameraId, 
                {
                  fps: 10,
                  qrbox: { width: 250, height: 250 },
                },
                (decodedText) => {
                  procesarResultadoQR(decodedText);
                },
                (errorMessage) => {
                  // Ignoramos errores menores durante el escaneo
                  console.log(errorMessage);
                }
              );
            } else {
              setError("No se encontraron cámaras disponibles");
              setEscaneando(false);
            }
          } else {
            setError("No se pudo encontrar el elemento para el escáner QR");
            setEscaneando(false);
          }
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
    if (qrScannerRef.current && qrScannerRef.current.isScanning) {
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
    <Card
      style={{ 
        width: '100%',
        maxWidth: '500px', 
        margin: '0 auto',
        backgroundColor: themeMode === 'dark' ? '#1f1f1f' : '#fff',
        zIndex: 100
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
              <div id={scannerDivId} style={{ width: '100%', height: '100%' }} />
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