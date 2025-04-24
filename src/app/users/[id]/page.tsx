'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Layout, Card, Form, Input, Button, Select, Skeleton, message, Space, Tag, Descriptions, Row, Col, Typography } from 'antd';
import { EditOutlined, SaveOutlined, CloseOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import type { Usuario } from '@/types/usuario';
import { 
  OPCIONES_GENERO, 
  OPCIONES_STATUS, 
} from '@/constants/options';
import UserQRCode from '@/components/UserQRCode';
import NotificacionAlerta from '@/components/NotificacionAlerta';
import GenerateImageQR from '@/components/generateImageQR';
const { Content } = Layout;
const { Option } = Select;
const { Title } = Typography;

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();
  const [isQRCodeScanned, setIsQRCodeScanned] = useState(false);
  const [mensajeQR, setMensajeQR] = useState('');
  const [tipoQR, setTipoQR] = useState<'exito' | 'error'>('exito');
  const [visibleQR, setVisibleQR] = useState(false);

  const ocultarAlerta = () => {
    setMensajeQR('');
    setTipoQR('exito');
    setVisibleQR(false);
  };

  // Cargar datos del usuario
  useEffect(() => {
    if (userId) {
      fetchUsuario(userId);
    }
  }, [userId]);

  const fetchUsuario = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/usuarios/${id}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar los datos del usuario');
      }
      
      const data = await response.json();
      setUsuario(data);
      form.setFieldsValue(data);
      setIsQRCodeScanned(data.qr_scanned_at ? true : false);
    } catch (error) {
      console.error('Error:', error);
      message.error('No se pudieron cargar los datos del usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleSave = async (values: Partial<Usuario>) => {
    try {
      setLoading(true);
      
      // Convertir el rol y edad a número antes de enviar
      const edad = values.edad ? Number(values.edad) : 0;
      const updatedValues = {
        ...values,
        edad: edad,
      };
      
      const response = await fetch(`/api/usuarios/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedValues),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar usuario');
      }
      
      const usuarioActualizado = await response.json();
      setUsuario(usuarioActualizado);
      setEditMode(false);
      message.success('Usuario actualizado correctamente');
    } catch (error) {
      console.error('Error:', error);
      message.error(`No se pudo actualizar el usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Restaurar valores originales del formulario
    form.setFieldsValue(usuario);
    setEditMode(false);
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/usuarios/${userId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar usuario');
      }
      
      message.success('Usuario eliminado correctamente');
      // Volver a la lista de usuarios
      router.push('/users');
    } catch (error) {
      console.error('Error:', error);
      message.error(`No se pudo eliminar el usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
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

  const refreshQR = async (id: string) => {
    try {
      const response = await fetch(`/api/usuarios/${id}/refresh-qr`);
      if (!response.ok) {
        throw new Error('Error al refrescar el QR');
      }
      const data = await response.json();
      setUsuario(data);
      setMensajeQR('QR actualizado correctamente');
      setTipoQR('exito');
      setVisibleQR(true);
    } catch (error) {
      console.error('Error:', error);
      setMensajeQR('No se pudo actualizar el QR');
      setTipoQR('error');
      setVisibleQR(true);
    }
  };

  return (
      <Content>
        <Card
          loading={loading}
          title={
            <Row justify="space-between" align="middle">
              <Col>
                <Title level={4}>
                  {loading ? 'Cargando...' : (usuario?.nombre || 'Detalle de Usuario')}
                </Title>
              </Col>
              <Col>
                <Space>
                  {!editMode ? (
                    <>
                     <GenerateImageQR userId={usuario?.id || ''} nombre={usuario?.nombre || ''}/>
                     <Button 
                      type="primary"
                      icon={<ReloadOutlined />}
                      onClick={() => {
                        refreshQR(userId);
                      }}
                     >
                      Refrescar QR
                     </Button>
                      <Button 
                        type="primary" 
                        icon={<EditOutlined />} 
                        onClick={handleEdit}
                      >
                        Editar
                      </Button>
                      <Button 
                        type="primary" 
                        danger 
                        icon={<DeleteOutlined />}
                        onClick={handleDelete}
                      >
                        Eliminar
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        onClick={handleCancel}
                        icon={<CloseOutlined />}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="primary" 
                        icon={<SaveOutlined />}
                        onClick={form.submit}
                      >
                        Guardar
                      </Button>
                    </>
                  )}
                </Space>
              </Col>
            </Row>
          }
          style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
        >
          <NotificacionAlerta
            mensaje={mensajeQR}
            tipo={tipoQR}
            visible={visibleQR}
            onClose={ocultarAlerta}
            duracion={5000}
          />
          {/* Div para el QR */}
          <div style={{ marginBottom: '16px', textAlign: 'center' }}>
            {loading ? (
              <Skeleton.Avatar active size={128} shape="square" />
            ) : (
              <UserQRCode checked={isQRCodeScanned} size={150} />
            )}
          </div>
          {loading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : (
            <>
              {!editMode ? (
                <Descriptions
                  bordered
                  column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}
                >
                  <Descriptions.Item label="Nombre">{usuario?.nombre}</Descriptions.Item>
                  <Descriptions.Item label="Email">{usuario?.email || "—"}</Descriptions.Item>
                  <Descriptions.Item label="Edad">{usuario?.edad}</Descriptions.Item>
                  <Descriptions.Item label="Género">{renderGenderTag(usuario?.genero || '')}</Descriptions.Item>
                  <Descriptions.Item label="Status">{renderStatusTag(usuario?.status || '')}</Descriptions.Item>
                  <Descriptions.Item label="Grupo">
                    {usuario?.grupo ? (
                      <Tag color={getGrupoColor(usuario.grupo)}>{usuario.grupo}</Tag>
                    ) : "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Invitado por">{usuario?.updated_by}</Descriptions.Item>
                  <Descriptions.Item label="Creado">
                    {usuario?.created_at ? new Date(usuario.created_at).toLocaleString() : "—"}
                  </Descriptions.Item>
                  {usuario?.updated_at && (
                    <Descriptions.Item label="Actualizado">
                      {usuario?.updated_at ? new Date(usuario.updated_at).toLocaleString() : "—"}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              ) : (
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSave}
                  initialValues={usuario || {}}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item 
                        name="nombre" 
                        label="Nombre" 
                        rules={[{ required: true, message: 'Por favor ingresa el nombre' }]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item 
                        name="email" 
                        label="Email" 
                        rules={[{ required: true, message: 'Por favor ingresa el email', type: 'email' }]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item 
                        name="genero" 
                        label="Género" 
                        rules={[{ required: true, message: 'Por favor selecciona el género' }]}
                      >
                        <Select placeholder="Selecciona un género">
                          {OPCIONES_GENERO.map(opcion => (
                            <Option key={opcion.value} value={opcion.value}>{opcion.label}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item 
                        name="edad" 
                        label="Edad"
                      >
                        <Input type="number" />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item 
                        name="status" 
                        label="Status" 
                        rules={[{ required: true, message: 'Por favor selecciona el status' }]}
                      >
                        <Select placeholder="Selecciona un status">
                          {OPCIONES_STATUS.map(opcion => (
                            <Option key={opcion.value} value={opcion.value}>{opcion.label}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item 
                        name="grupo" 
                        label="Grupo"
                      >
                        <Input placeholder="Ingresa el grupo" />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Form.Item name="rol" label="Rol">
                    <Input type="number" />
                  </Form.Item>
                </Form>
              )}
            </>
          )}
        </Card>
      </Content>
  );
} 