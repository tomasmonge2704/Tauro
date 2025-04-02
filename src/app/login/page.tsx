'use client';

import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Steps, Alert, Image } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import bcrypt from 'bcryptjs';
import { signIn } from 'next-auth/react';

const { Title, Text } = Typography;
const { Step } = Steps;

interface EmailCheckResponse {
  exists: boolean;
  hasPassword: boolean;
  userId?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { themeMode } = useTheme();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [hasPassword, setHasPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Paso 1: Verificar si el email existe
  const handleEmailCheck = async (values: { email: string }) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(values.email)}`);
      
      if (!response.ok) {
        throw new Error('Error al verificar el email');
      }
      
      const data: EmailCheckResponse = await response.json();
      
      setEmail(values.email);
      setHasPassword(data.hasPassword);
      
      if (data.exists) {
        if (data.userId) {
          setUserId(data.userId);
        }
        setCurrentStep(1);
      } else {
        setError('No existe un usuario con este email. Por favor, contacta al administrador.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al verificar el email. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Paso 2a: Iniciar sesión con contraseña existente
  const handleLogin = async (values: { password: string }) => {
    try {
      setLoading(true);
      setError(null);
      
      // Usar redirección directa de NextAuth
      await signIn('credentials', {
        redirect: true,
        callbackUrl: '/',
        email,
        password: values.password,
      });
      
      // No es necesario manejar la redirección manualmente si redirect: true
    } catch (error) {
      console.error('Error:', error);
      setError('Contraseña incorrecta. Inténtalo de nuevo.');
      setLoading(false);
    }
  };

  // Paso 2b: Crear nueva contraseña
  const handleCreatePassword = async (values: { password: string; confirmPassword: string }) => {
    try {
      setLoading(true);
      setError(null);
      
      if (values.password !== values.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }
      
      if (!userId) {
        setError('Error de identificación de usuario');
        return;
      }
      
      // Encriptar la contraseña en el cliente
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(values.password, salt);
      
      const response = await fetch(`/api/usuarios/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          password: hashedPassword 
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear la contraseña');
      }
      
      message.success('Contraseña creada exitosamente');
      
      // Iniciar sesión automáticamente con NextAuth
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password: values.password,
      });

      if (result?.error) {
        // Si falla el inicio automático, redirigir al login
        setCurrentStep(0);
        message.info('Por favor, inicia sesión con tu nueva contraseña');
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al crear la contraseña. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setCurrentStep(0);
    setError(null);
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '90vh',
      backgroundColor: themeMode === 'dark' ? '#141414' : '#f0f0f0'
    }}>
      <Card 
        style={{ 
          width: 400, 
          boxShadow: 'none',
          backgroundColor: 'transparent',
          border: 'none'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Image src="/logo.png" alt="Logo" preview={false} width={120} height={120} style={{ filter: themeMode === 'dark' ? 'invert(0)' : 'invert(1)' }} />

          <Title level={2} style={{ color: themeMode === 'dark' ? '#fff' : undefined }}>
            Iniciar Sesión
          </Title>
          {currentStep > 0 && (
            <Steps current={currentStep} size="small" style={{ marginBottom: 24 }}>
              <Step title="Email" />
              <Step title={hasPassword ? "Contraseña" : "Crear Contraseña"} />
            </Steps>
          )}
        </div>
        
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        
        {currentStep === 0 && (
          <Form
            form={form}
            name="email_check"
            onFinish={handleEmailCheck}
            layout="vertical"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Por favor ingresa tu email' },
                { type: 'email', message: 'Por favor ingresa un email válido' }
              ]}
            >
              <Input 
                prefix={<MailOutlined />} 
                placeholder="Email" 
                size="large" 
              />
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large" 
                block 
                loading={loading}
              >
                Continuar
              </Button>
            </Form.Item>
          </Form>
        )}
        
        {currentStep === 1 && hasPassword && (
          <Form
            name="login"
            onFinish={handleLogin}
            layout="vertical"
          >
            
            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Por favor ingresa tu contraseña' }]}
            >
              <Input.Password 
                placeholder="Contraseña" 
                size="large" 
              />
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large" 
                block 
                loading={loading}
              >
                Iniciar Sesión
              </Button>
            </Form.Item>
            
            <Button 
              type="link" 
              onClick={handleBack}
              style={{ padding: 0 }}
            >
              Volver
            </Button>
          </Form>
        )}
        
        {currentStep === 1 && !hasPassword && (
          <Form
            name="create_password"
            onFinish={handleCreatePassword}
            layout="vertical"
          >
            <Form.Item>
              <Text style={{ color: themeMode === 'dark' ? '#fff' : undefined }}>
                Email: {email}
              </Text>
            </Form.Item>
            
            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Por favor crea una contraseña' },
                { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' }
              ]}
            >
              <Input.Password 
                placeholder="Nueva contraseña" 
                size="large" 
              />
            </Form.Item>
            
            <Form.Item
              name="confirmPassword"
              rules={[
                { required: true, message: 'Por favor confirma tu contraseña' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Las contraseñas no coinciden'));
                  },
                }),
              ]}
            >
              <Input.Password 
                placeholder="Confirmar contraseña" 
                size="large" 
              />
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large" 
                block 
                loading={loading}
              >
                Crear Contraseña
              </Button>
            </Form.Item>
            
            <Button 
              type="link" 
              onClick={handleBack}
              style={{ padding: 0 }}
            >
              Volver
            </Button>
          </Form>
        )}
      </Card>
    </div>
  );
}