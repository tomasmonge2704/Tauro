'use client';

import { Layout, Table, Modal, Form, Input, Button, message, Space, Select } from 'antd';
import { NavBar } from '@/components/NavBar';
import { useState, useEffect } from 'react';
import { EditOutlined, DeleteOutlined, UserAddOutlined } from '@ant-design/icons';
import type { Usuario } from '@/types/usuario';

const { Content } = Layout;
const { Option } = Select;

// Definir opciones para los selectores
const OPCIONES_GENERO = [
  { value: 'Masculino', label: 'Masculino' },
  { value: 'Femenino', label: 'Femenino' },
  { value: 'No binario', label: 'No binario' },
  { value: 'Prefiero no decir', label: 'Prefiero no decir' }
];

const OPCIONES_STATUS = [
  { value: 'Activo', label: 'Activo' },
  { value: 'Inactivo', label: 'Inactivo' },
  { value: 'Pendiente', label: 'Pendiente' }
];

export default function UsersPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalCrearVisible, setModalCrearVisible] = useState(false);
  const [form] = Form.useForm();

  // Cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/usuarios');
      if (!response.ok) throw new Error('Error al cargar usuarios');
      const data = await response.json();
      setUsuarios(data);
    } catch (error) {
      console.error('Error:', error);
      message.error('No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (usuario: Usuario) => {
    setUsuarioEditando(usuario);
  };

  const handleSave = async (values: Partial<Usuario>) => {
    if (!usuarioEditando) return;
    
    try {
      const response = await fetch(`/api/usuarios/${usuarioEditando.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) throw new Error('Error al actualizar usuario');
      
      const usuarioActualizado = await response.json();
      
      setUsuarios(prevUsuarios =>
        prevUsuarios.map(usuario =>
          usuario.id === usuarioActualizado.id ? usuarioActualizado : usuario
        )
      );
      
      message.success('Usuario actualizado correctamente');
      setUsuarioEditando(null);
    } catch (error) {
      console.error('Error:', error);
      message.error('No se pudo actualizar el usuario');
    }
  };

  const handleCancel = () => {
    setUsuarioEditando(null);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/usuarios/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Error al eliminar usuario');
      
      setUsuarios(prevUsuarios => prevUsuarios.filter(usuario => usuario.id !== id));
      message.success('Usuario eliminado correctamente');
    } catch (error) {
      console.error('Error:', error);
      message.error('No se pudo eliminar el usuario');
    }
  };

  const showCrearModal = () => {
    form.resetFields();
    setModalCrearVisible(true);
  };

  const handleCrearCancel = () => {
    setModalCrearVisible(false);
  };

  const handleCrearUsuario = async (values: Omit<Usuario, 'id'>) => {
    try {
      const response = await fetch('/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) throw new Error('Error al crear usuario');
      
      const nuevoUsuario = await response.json();
      
      setUsuarios(prevUsuarios => [...prevUsuarios, nuevoUsuario]);
      message.success('Usuario creado correctamente');
      setModalCrearVisible(false);
    } catch (error) {
      console.error('Error:', error);
      message.error('No se pudo crear el usuario');
    }
  };

  // Definición de columnas para la tabla
  const columnas = [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Genero',
      dataIndex: 'genero',
      key: 'genero',
      filters: [
        { text: 'Masculino', value: 'Masculino' },
        { text: 'Femenino', value: 'Femenino' },
      ],
      onFilter: (value: string | number | boolean, record: Usuario) => record.genero.includes(value as string),
      sorter: (a: Usuario, b: Usuario) => a.genero.localeCompare(b.genero),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Activo', value: 'Activo' },
        { text: 'Inactivo', value: 'Inactivo' },
      ],
      onFilter: (value: string | number | boolean, record: Usuario) => record.status.includes(value as string),
      sorter: (a: Usuario, b: Usuario) => a.status.localeCompare(b.status),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: string, record: Usuario) => (
        <span>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ marginRight: 8 }}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </span>
      ),
    }
  ];

  return (
    <Layout style={{ backgroundColor: 'white', minHeight: '100vh' }}>
      <NavBar title="Usuarios" />
      <Content style={{ padding: '20px' }}>
        <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            type="primary" 
            icon={<UserAddOutlined />} 
            onClick={showCrearModal}
          >
            Agregar Usuario
          </Button>
        </Space>
        
        <Table
          dataSource={usuarios} 
          columns={columnas as any} 
          rowKey="id" 
          pagination={{ pageSize: 10 }}
          loading={loading}
          style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
        />
        
        {/* Modal para editar usuario */}
        {usuarioEditando && (
          <Modal
            title="Editar Invitado"
            open={true}
            onCancel={handleCancel}
            footer={null}
          >
            <Form
              initialValues={usuarioEditando}
              onFinish={handleSave}
              layout="vertical"
            >
              <Form.Item name="nombre" label="Nombre" rules={[{ required: true, message: 'Por favor ingresa el nombre' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Por favor ingresa el email', type: 'email' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="rol" label="Rol">
                <Input />
              </Form.Item>
              <Form.Item name="edad" label="Edad">
                <Input type="number" />
              </Form.Item>
              <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Por favor selecciona el status' }]}>
                <Select placeholder="Selecciona un status">
                  {OPCIONES_STATUS.map(opcion => (
                    <Option key={opcion.value} value={opcion.value}>{opcion.label}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="genero" label="Género" rules={[{ required: true, message: 'Por favor selecciona el género' }]}>
                <Select placeholder="Selecciona un género">
                  {OPCIONES_GENERO.map(opcion => (
                    <Option key={opcion.value} value={opcion.value}>{opcion.label}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Guardar
                </Button>
                <Button onClick={handleCancel} style={{ marginLeft: '8px' }}>
                  Cancelar
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        )}
        
        {/* Modal para crear usuario */}
        <Modal
          title="Agregar Invitado"
          open={modalCrearVisible}
          onCancel={handleCrearCancel}
          footer={null}
        >
          <Form
            form={form}
            onFinish={handleCrearUsuario}
            layout="vertical"
          >
            <Form.Item name="nombre" label="Nombre" rules={[{ required: true, message: 'Por favor ingresa el nombre' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Por favor ingresa el email', type: 'email' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="rol" label="Rol" initialValue="Invitado">
              <Input />
            </Form.Item>
            <Form.Item name="edad" label="Edad" initialValue={25}>
              <Input type="number" />
            </Form.Item>
            <Form.Item name="status" label="Status" initialValue="Activo" rules={[{ required: true, message: 'Por favor selecciona el status' }]}>
              <Select placeholder="Selecciona un status">
                {OPCIONES_STATUS.map(opcion => (
                  <Option key={opcion.value} value={opcion.value}>{opcion.label}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="genero" label="Género" rules={[{ required: true, message: 'Por favor selecciona el género' }]}>
              <Select placeholder="Selecciona un género">
                {OPCIONES_GENERO.map(opcion => (
                  <Option key={opcion.value} value={opcion.value}>{opcion.label}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Crear
              </Button>
              <Button onClick={handleCrearCancel} style={{ marginLeft: '8px' }}>
                Cancelar
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
}