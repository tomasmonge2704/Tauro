import { Button, Modal } from "antd";
import { QrcodeOutlined } from "@ant-design/icons";
import { useState, useRef, useEffect } from "react";
import { Document, Page, View, Image, Text, StyleSheet } from '@react-pdf/renderer';
import { PDFViewer } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import CopyImageQR from './copyImageQR';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#000000',
    padding: 0,
    position: 'relative',
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  userInfo: {
    fontSize: 16,
    textAlign: 'center',
    color: '#ffffff',
    marginTop: 10,
    marginBottom: 20,
    position: 'relative',
  },
  qrContainer: {
    alignSelf: 'center',
    position: 'relative',
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 10,
    width: 140,
    height: 140,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  background: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    top: 0,
    left: 0,
    zIndex: -1,
  },
  contentContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 10,
    position: 'relative',
  }
});

// Estilos para la versión HTML
const htmlStyles = {
  page: {
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: '#000000',
    padding: 0,
    position: 'relative' as const,
    width: '300px',
    height: '450px',
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

const MyDocument = ({ userData }: { userData: { nombre: string, userId: string } }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    const generateQR = async () => {
      try {
        const url = await QRCode.toDataURL(userData.userId, {
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
  }, [userData.userId]);

  return (
    <Document>
      <Page size="A6" style={styles.page}>
        <Image
          src="/banner.png"
          style={styles.background}
        />
        <View style={styles.contentContainer}>
          <Image
            src="/logo-verde.png"
            style={styles.logo}
          />
          <Text style={styles.userInfo}>
            {userData.nombre}
          </Text>
          <View style={styles.qrContainer}>
            {qrCodeUrl && <Image src={qrCodeUrl} style={{ width: 120, height: 120 }} />}
          </View>
        </View>
      </Page>
    </Document>
  );
};

// Componente HTML para la copia
const HTMLDocument = ({ userData, qrCodeUrl }: { userData: { nombre: string, userId: string }, qrCodeUrl: string }) => (
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
        {userData.nombre}
      </div>
      <div style={htmlStyles.qrContainer}>
        {qrCodeUrl && <img src={qrCodeUrl} style={{ width: '120px', height: '120px' }} alt="QR Code" />}
      </div>
    </div>
  </div>
);

export default function GenerateImageQR({ userId, nombre }: { userId: string, nombre: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const htmlDocRef = useRef<HTMLDivElement>(null);

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

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        type="primary"
        icon={<QrcodeOutlined />}
        onClick={showModal}
      >
        Generate Image
      </Button>
      <Modal
        title="Documento PDF"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <CopyImageQR key="copy" userId={userId} nombre={nombre} />
        ]}
        width={800}
      >
        <div style={{ position: 'relative' }}>
          <PDFViewer style={{ width: '100%', height: '500px' }}>
            <MyDocument userData={{ nombre, userId }} />
          </PDFViewer>
          <div ref={htmlDocRef} style={{ position: 'absolute', left: '-9999px', top: 0 }}>
            <HTMLDocument userData={{ nombre, userId }} qrCodeUrl={qrCodeUrl} />
          </div>
        </div>
      </Modal>
    </>
  );
}
