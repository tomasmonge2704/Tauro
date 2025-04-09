'use client';

import { Typography, Layout, Button } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;
const { Content } = Layout;

export default function InfoPage() {
  return (
    <Content className='home-page-background' style={{ marginTop: '7vh', textAlign: 'center', display: 'grid', gap: '10px', justifyContent: 'center' }}>
      <div>
      <Title level={1} style={{ fontSize: '50px', color: '#5eac50', marginBottom: '5px' }} >
        TAURO
      </Title>
        <Button 
          style={{ height: '22px', width: '100%'}} 
          type='dashed' 
          icon={<EnvironmentOutlined />}
          onClick={() => window.open('https://maps.app.goo.gl/9aT1Jfj9eGgJ9hwV9', '_blank')}
        >
          Ubicación
        </Button>
      </div>
      
      <Title level={1} style={{ marginTop: '50px' }} >
        LINE UP
      </Title>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <Text className="slide-in-text slide-delay-2" style={{ fontSize: '20px' }}>
        Tomas Monge
      </Text>
      <Text className="slide-in-text slide-delay-2" style={{ fontSize: '20px' }}>
        Yiyo Fernández
      </Text>
      <Text className="slide-in-text slide-delay-2" style={{ fontSize: '20px' }}>
        ????
      </Text>
      </div>
    </Content>
  );
}