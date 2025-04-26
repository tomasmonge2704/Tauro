import { Button, message } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import { createRoot } from 'react-dom/client';
import NotificacionAlerta from './NotificacionAlerta';

interface CopyImageQRProps {
  userId: string;
  nombre: string;
  xs?: boolean;
}

// Estilos para el HTML que se copiará
const htmlStyles = {
  page: {
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: '#000000',
    padding: 0,
    position: 'relative' as const,
    width: '300px',
    height: '500px',
  },
  logo: {
    width: '150px',
    height: '150px',
    alignSelf: 'center',
    marginBottom: '10px',
    position: 'relative' as const,
  },
  userInfo: {
    fontSize: '16px',
    textAlign: 'center' as const,
    color: '#ffffff',
    marginTop: '10px',
    marginBottom: '20px',
    position: 'relative' as const,
  },
  qrContainer: {
    alignSelf: 'center',
    position: 'relative' as const,
    backgroundColor: '#ffffff',
    padding: '10px',
    borderRadius: '10px',
    width: '140px',
    height: '140px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  background: {
    width: '100%',
    height: '100%',
    position: 'absolute' as const,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  contentContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: '10px',
    position: 'relative' as const,
    zIndex: 2,
  }
};

const HTMLDocument = ({ nombre, qrCodeUrl }: { nombre: string, qrCodeUrl: string }) => (
  <div style={htmlStyles.page}>
    <img
      src="/banner.png"
      style={htmlStyles.background}
      alt="background"
    />
    <div style={htmlStyles.contentContainer}>
      <img
        src="/logo-verde.png"
        style={htmlStyles.logo}
        alt="logo"
      />
      <div style={htmlStyles.userInfo}>
        {nombre}
      </div>
      <div style={htmlStyles.qrContainer}>
        {qrCodeUrl && <img src={qrCodeUrl} style={{ width: '120px', height: '120px' }} alt="QR Code" />}
      </div>
    </div>
  </div>
);

export default function CopyImageQR({ userId, nombre, xs }: CopyImageQRProps) {
  const [isCopying, setIsCopying] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const generateQR = async () => {
      try {
        const url = await QRCode.toDataURL(userId, {
          margin: 1,
          width: 120,
          errorCorrectionLevel: 'H'
        });
        setQrCodeUrl(url);
      } catch (err) {
        console.error('Error generando QR:', err);
      }
    };

    generateQR();
  }, [userId]);

  const handleCopyToClipboard = async () => {
    try {
      setIsCopying(true);
      
      // Crear el elemento temporal solo cuando se necesita
      const tempDiv = document.createElement('div');
      tempDiv.style.width = '300px';
      tempDiv.style.height = '500px';
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      document.body.appendChild(tempDiv);

      // Renderizar el contenido en el elemento temporal
      const content = (
        <HTMLDocument nombre={nombre} qrCodeUrl={qrCodeUrl} />
      );
      
      // Usar ReactDOM.render para renderizar el contenido
      const root = createRoot(tempDiv);
      root.render(content);

      // Esperar un momento para asegurar que el contenido se renderice
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(tempDiv, {
        scale: 4,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: null,
        imageTimeout: 0,
      });

      const targetWidth = 1200;
      const aspectRatio = canvas.height / canvas.width;
      const targetHeight = targetWidth * aspectRatio;

      const resizedCanvas = document.createElement('canvas');
      resizedCanvas.width = targetWidth;
      resizedCanvas.height = targetHeight;

      const ctx = resizedCanvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight);
      }

      resizedCanvas.toBlob(async (blob) => {
        if (blob) {
          try {
            // Verificar si la API del portapapeles está disponible
            if (navigator.clipboard && navigator.clipboard.write) {
              await navigator.clipboard.write([
                new ClipboardItem({
                  'image/png': blob
                })
              ]);
              setShowAlert(true);
            } else {
              // Alternativa para dispositivos que no soportan la API del portapapeles
              const imgUrl = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = imgUrl;
              link.download = `qr-${nombre}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(imgUrl);
              message.success('Imagen descargada');
            }
          } catch (err) {
            console.error('Error al copiar:', err);
            // Intentar descargar la imagen como alternativa
            const imgUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = imgUrl;
            link.download = `qr-${nombre}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(imgUrl);
            message.success('Imagen descargada');
          }
        }
      }, 'image/png', 1.0);

      // Limpiar el elemento temporal
      root.unmount();
      document.body.removeChild(tempDiv);

    } catch (error) {
      message.error('Error al generar la imagen');
      console.error('Error:', error);
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <>
      <Button 
        type="primary" 
        icon={<CopyOutlined />} 
        onClick={handleCopyToClipboard}
        loading={isCopying}
      >
        {xs ? '' : 'Copiar como imagen'}
      </Button>
      <NotificacionAlerta
        mensaje="Imagen copiada exitosamente al portapapeles"
        tipo="exito"
        visible={showAlert}
        onClose={() => setShowAlert(false)}
        duracion={3000}
      />
    </>
  );
}
