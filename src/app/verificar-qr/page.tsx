'use client';

import { useState, useEffect, useRef } from 'react';
import { Layout, Card, Button, Result, Spin, Typography, Descriptions, Tag, Space, Alert } from 'antd';
import { CameraOutlined, QrcodeOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTheme } from '@/context/ThemeContext';
import QrScanner from 'qr-scanner';

const { Content } = Layout;
const { Text } = Typography;

interface UsuarioQR {
  id: string;
  nombre: string;
  email: string;
  status: string;
  genero: string;
  grupo: string;
  created_at: string;
}

interface VerificacionQR {
  valid: boolean;
  usuario?: UsuarioQR;
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

      if (!scannerRef.current && videoRef.current) {
        scannerRef.current = new QrScanner(
          videoRef.current,
          (result) => {
            procesarResultadoQR(result.data);
          },
          {
            highlightScanRegion: true,
          }
        );
      }

      if (scannerRef.current) {
        await scannerRef.current.start();
      }
    } catch (err) {
      console.error('Error al iniciar el escáner:', err);
      setError('Error al iniciar el escáner. Inténtalo de nuevo.');
      setEscaneando(false);
    }
  };

  const detenerEscaneo = async () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      setEscaneando(false);
    }
  };

  const procesarResultadoQR = async (qrToken: string) => {
    try {
      detenerEscaneo();
      setVerificando(true);
      
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
    } catch (error) {
      console.error('Error al verificar QR:', error);
      setResultado({
        valid: false,
        error: 'Error al procesar el código QR'
      });
    } finally {
      setVerificando(false);
    }
  };

  // Función para renderizar el tag de estado
  const renderStatusTag = (status: string) => {
    let color = 'green';
    if (status === 'Inactivo') color = 'red';
    if (status === 'Pendiente') color = 'orange';
    return <Tag color={color}>{status}</Tag>;
  };

  // Función para renderizar el tag de género
  const renderGenderTag = (genero: string) => {
    let color = 'blue';
    if (genero === 'Mujer') color = 'pink';
    if (genero === 'No binario') color = 'purple';
    if (genero === 'Prefiere no decir') color = 'gray';
    return <Tag color={color}>{genero}</Tag>;
  };

  // Función para obtener el color del tag según el grupo
  const getGrupoColor = (grupo: string): string => {
    switch (grupo) {
      case 'Administración':
        return 'blue';
      case 'Ventas':
        return 'green';
      case 'Marketing':
        return 'purple';
      case 'Desarrollo':
        return 'cyan';
      case 'Soporte':
        return 'orange';
      case 'Recursos Humanos':
        return 'pink';
      default:
        return 'default';
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
            <Spin tip="Verificando código QR...">
              <div style={{ height: '100px' }} />
            </Spin>
          </div>
        ) : resultado ? (
          resultado.valid ? (
            <Result
              status="success"
              title="¡QR Verificado Correctamente!"
              subTitle={`Usuario identificado: ${resultado.usuario?.nombre}`}
              extra={[
                <Button 
                  type="primary" 
                  key="scan-again" 
                  icon={<ReloadOutlined />}
                  onClick={() => setResultado(null)}
                >
                  Verificar otro código
                </Button>,
              ]}
            >
              <Descriptions
                title="Información del Usuario"
                bordered
                column={1}
                size="small"
                style={{ marginTop: '16px' }}
              >
                <Descriptions.Item label="Nombre">{resultado.usuario?.nombre}</Descriptions.Item>
                <Descriptions.Item label="Email">{resultado.usuario?.email}</Descriptions.Item>
                <Descriptions.Item label="Status">{renderStatusTag(resultado.usuario?.status || '')}</Descriptions.Item>
                <Descriptions.Item label="Género">{renderGenderTag(resultado.usuario?.genero || '')}</Descriptions.Item>
                <Descriptions.Item label="Grupo">
                  {resultado.usuario?.grupo ? (
                    <Tag color={getGrupoColor(resultado.usuario.grupo)}>{resultado.usuario.grupo}</Tag>
                  ) : "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Creado">
                  {resultado.usuario?.created_at ? new Date(resultado.usuario.created_at).toLocaleString() : "—"}
                </Descriptions.Item>
              </Descriptions>
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
                  onClick={() => setResultado(null)}
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
                overflow: 'hidden'
              }}
            >
              <video ref={videoRef} style={{ display: escaneando ? 'block' : 'none', width: '100%' }} />
              {!escaneando && (
                <Text type="secondary" style={{ textAlign: 'center' }}>
                  <QrcodeOutlined style={{ fontSize: '32px', marginBottom: '8px', display: 'block' }} />
                  Haz clic en &quot;Iniciar verificador&quot; para comenzar
                </Text>
              )}
            </div>
            
            {escaneando && (
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <Space>
                  <Button onClick={detenerEscaneo}>Detener</Button>
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
            Verificador seguro para códigos QR de identificación
          </Text>
        </Space>
      </div>
    </Content>
  );
} 