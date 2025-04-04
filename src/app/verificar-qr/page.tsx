'use client';

import { Layout, Typography, Space } from 'antd';
import { QrcodeOutlined } from '@ant-design/icons';
import VerificadorQR from './VerificadorQR';

const { Content } = Layout;
const { Text } = Typography;

export default function VerificarQRPage() {
  return (
    <Content style={{ padding: '24px' }}>
      <VerificadorQR />
      
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