'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Card, Typography, Alert, theme } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = theme.useToken();

  const handleSubmit = async (values: { email: string; password: string }) => {
    setLoading(true);
    setError('');
    
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (result?.error) {
        setError('Credenciales inválidas. Por favor, intenta de nuevo.');
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Error durante el inicio de sesión:', error);
      setError('Ocurrió un error durante el inicio de sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      padding: '20px',
      background: token.colorBgLayout
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: '400px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
        }} 
        bordered={false}
      >
        <Title level={2} style={{ textAlign: 'center', color: token.colorTextHeading }}>Iniciar Sesión</Title>
        
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: '24px' }}
          />
        )}
        
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={handleSubmit}
          layout="vertical"
        >
          <Form.Item
            name="email"
            label={<span style={{ color: token.colorTextLabel }}>Correo Electrónico</span>}
            rules={[{ required: true, message: 'Por favor ingresa tu correo electrónico' }]}
          >
            <Input 
              prefix={<MailOutlined style={{ color: token.colorPrimary }} />} 
              placeholder="tu@email.com" 
              size="large"
              style={{ backgroundColor: 'transparent' }}
              className="remove-autocomplete-bg"
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            label={<span style={{ color: token.colorTextLabel }}>Contraseña</span>}
            rules={[{ required: true, message: 'Por favor ingresa tu contraseña' }]}
          >
            <Input.Password 
              prefix={<LockOutlined style={{ color: token.colorPrimary }} />} 
              placeholder="********" 
              size="large"
              style={{ backgroundColor: 'transparent' }}
              className="remove-autocomplete-bg"
            />
          </Form.Item>
          
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}