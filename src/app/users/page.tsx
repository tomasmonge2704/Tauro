'use client';

import { Table, Modal, Form, Input, Button, message, Space, Select, Pagination, Input as AntInput, Row, Col, Card, Slider, Tag, Popconfirm, Badge, Tooltip } from 'antd';
import { useState, useEffect } from 'react';
import { EditOutlined, DeleteOutlined, UserAddOutlined, SearchOutlined, FilterOutlined, ClearOutlined, WarningOutlined } from '@ant-design/icons';
import type { Usuario } from '@/types/usuario';
import { ColumnsType } from 'antd/es/table';
import { useRouter } from 'next/navigation';
import { 
  OPCIONES_GENERO, 
  OPCIONES_STATUS, 
  getGrupoColor,
} from '@/constants/options';
import { isMobile } from 'react-device-detect';
import { convertirMoneda } from '../utils/convertirMoneda';
import NotificacionAlerta from '@/components/NotificacionAlerta';
import useAlerta from '@/hooks/useAlerta';
import CopyImageQR from '@/components/copyImageQR';

const { Option } = Select;
const { Search } = AntInput;

// Interfaz para los datos de paginación
interface PaginationData {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Interfaz para los filtros
interface Filtros {
  search: string;
  genero: string;
  status: string;
  grupo: string;
  montoMin: number | null;
  montoMax: number | null;
}

export default function UsersPage() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalCrearVisible, setModalCrearVisible] = useState(false);
  const [filtrosVisibles, setFiltrosVisibles] = useState(false);
  const [form] = Form.useForm();
  const [formFiltros] = Form.useForm();
  const [emailVaciosCount, setEmailVaciosCount] = useState<number>(0);
  const [isBrowser, setIsBrowser] = useState(false);
  
  const { alerta, mostrarExito, mostrarError, ocultarAlerta } = useAlerta();

  useEffect(() => {
    setIsBrowser(true);
  }, []);
  
  // Estado para los filtros
  const [filtros, setFiltros] = useState<Filtros>({
    search: '',
    genero: '',
    status: '',
    grupo: '',
    montoMin: null,
    montoMax: null
  });
  
  // Estado para la paginación
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0
  });

  // Cargar usuarios al montar el componente o cuando cambian los filtros o la paginación
  useEffect(() => {
    fetchUsuarios(pagination.page, pagination.pageSize, filtros);
    fetchEmailVaciosCount();
  }, [pagination.page, pagination.pageSize, filtros]);

  const fetchUsuarios = async (page: number, pageSize: number, filtros: Filtros) => {
    try {
      setLoading(true);
      
      // Construir los parámetros de consulta
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('pageSize', pageSize.toString());
      
      if (filtros.search) {
        params.append('search', filtros.search);
      }
      
      if (filtros.genero) {
        params.append('genero', filtros.genero);
      }
      
      if (filtros.status) {
        params.append('status', filtros.status);
      }
      
      if (filtros.grupo) {
        params.append('grupo', filtros.grupo);
      }
      
      if (filtros.montoMin !== null) {
        params.append('montoMin', filtros.montoMin.toString());
      }
      
      if (filtros.montoMax !== null) {
        params.append('montoMax', filtros.montoMax.toString());
      }
      
      const response = await fetch(`/api/usuarios?${params.toString()}`);
      
      if (!response.ok) throw new Error('Error al cargar usuarios');
      
      const result = await response.json();
      
      setUsuarios(result.data);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Error:', error);
      message.error('No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener el conteo de usuarios con email vacío
  const fetchEmailVaciosCount = async () => {
    try {
      const response = await fetch('/api/usuarios/count-empty-email');
      
      if (!response.ok) throw new Error('Error al obtener conteo de emails vacíos');
      
      const data = await response.json();
      setEmailVaciosCount(data.count || 0);
    } catch (error) {
      console.error('Error:', error);
      message.error('No se pudo obtener el conteo de emails vacíos');
    }
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    setPagination(prev => ({
      ...prev,
      page,
      pageSize: pageSize || prev.pageSize
    }));
  };

  const handleSearch = (value: string) => {
    setFiltros(prev => ({
      ...prev,
      search: value
    }));
    // Resetear a la primera página cuando se realiza una búsqueda
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  };
  
  const toggleFiltros = () => {
    setFiltrosVisibles(!filtrosVisibles);
  };
  
  const aplicarFiltros = (values: Usuario) => {
    setFiltros(prev => ({
      ...prev,
      genero: values.genero || '',
      status: values.status || '',
      grupo: values.grupo || '',
      montoMin: Array.isArray(values.monto_pago) ? values.monto_pago[0] : null,
      montoMax: Array.isArray(values.monto_pago) ? values.monto_pago[1] : null
    }));
    
    // Resetear a la primera página cuando se aplican filtros
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  };
  
  const limpiarFiltros = () => {
    formFiltros.resetFields();
    setFiltros({
      search: filtros.search, // Mantener la búsqueda por texto
      genero: '',
      status: '',
      grupo: '',
      montoMin: null,
      montoMax: null
    });
    
    // Resetear a la primera página
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  };

  const handleEdit = (usuario: Usuario) => {
    setUsuarioEditando(usuario);
  };

  const handleSave = async (values: Partial<Usuario>) => {
    if (!usuarioEditando) return;
    
    try {
      setLoading(true);
      // Convertir el rol a número antes de enviarlo
      const edad = values.edad ? Number(values.edad) : 0;
      const updatedValues = {
        ...values,
        edad: edad,
      };
      const response = await fetch(`/api/usuarios/${usuarioEditando.id}`, {
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
      
      setUsuarioEditando(null);
      
      // Actualizar la lista de usuarios
      setUsuarios(prevUsuarios =>
        prevUsuarios.map(usuario =>
          usuario.id === usuarioActualizado.id ? usuarioActualizado : usuario
        )
      );
      
      // Mostrar alerta de éxito en lugar de message
      mostrarExito('Usuario actualizado correctamente');
    } catch (error) {
      console.error('Error:', error);
      // Mostrar alerta de error en lugar de message
      mostrarError(`No se pudo actualizar el usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setUsuarioEditando(null);
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/usuarios/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar usuario');
      }
      
      // Eliminar el usuario de la lista actual
      setUsuarios(prevUsuarios => prevUsuarios.filter(usuario => usuario.id !== id));
      
      // Si después de eliminar un usuario la página queda vacía y no es la primera página,
      // ir a la página anterior
      if (usuarios.length === 1 && pagination.page > 1) {
        handlePageChange(pagination.page - 1);
      } else {
        // Recargar la página actual para mantener la consistencia
        fetchUsuarios(pagination.page, pagination.pageSize, filtros);
      }
      
      // Mostrar alerta de éxito en lugar de message
      mostrarExito('Usuario eliminado correctamente');
    } catch (error) {
      console.error('Error:', error);
      // Mostrar alerta de error en lugar de message
      mostrarError(`No se pudo eliminar el usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearUsuario = async (values: Partial<Usuario>) => {
    try {
      setLoading(true);
      const response = await fetch('/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear usuario');
      }
      
      // Recargar la primera página después de crear un usuario
      fetchUsuarios(1, pagination.pageSize, filtros);
      
      // Mostrar alerta de éxito en lugar de message
      mostrarExito('Usuario creado correctamente');
      setModalCrearVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Error:', error);
      // Mostrar alerta de error en lugar de message
      mostrarError(`No se pudo crear el usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearCancel = () => {
    setModalCrearVisible(false);
    form.resetFields();
  };

  // Función para navegar al detalle de usuario
  const handleUserClick = (id: string) => {
    router.push(`/users/${id}`);
  };

  const columnas: ColumnsType<Usuario> = [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      sorter: (a: Usuario, b: Usuario) => a.nombre.localeCompare(b.nombre),
      render: (text: string, record: Usuario) => (
        <a onClick={(e) => {
          e.stopPropagation();
          handleUserClick(record.id);
        }}>
          {text}
        </a>
      ),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: () => (
        <Space>
          Email
          {emailVaciosCount > 0 && (
            <Tooltip title={`${emailVaciosCount} usuarios con email vacío`}>
              <Badge count={emailVaciosCount} overflowCount={999} style={{ backgroundColor: '#faad14' }}>
                <WarningOutlined style={{ color: '#faad14' }} />
              </Badge>
            </Tooltip>
          )}
        </Space>
      ),
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => (a.email || '').localeCompare(b.email || ''),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Genero',
      dataIndex: 'genero',
      key: 'genero',
      render: (genero: string) => {
        let color = 'blue';
        if (genero === 'Mujer') color = 'pink';
        if (genero === 'No binario') color = 'purple';
        if (genero === 'Prefiere no decir') color = 'gray';
        return <Tag color={color}>{genero}</Tag>;
      },
      sorter: (a: Usuario, b: Usuario) => a.genero.localeCompare(b.genero),
      responsive: ['md', 'lg', 'xl'],
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusOption = OPCIONES_STATUS.find(opt => opt.value === status || opt.label === status);
        const color = statusOption?.color || 'default';
        return <Tag color={color}>{statusOption?.label || status}</Tag>;
      },
      sorter: (a: Usuario, b: Usuario) => a.status?.localeCompare(b.status),
      responsive: ['md', 'lg', 'xl'],
    },
    {
      title: 'Monto Pagado',
      dataIndex: 'monto_pago',
      key: 'monto_pago',
      render: (monto_pago: number) => (
        monto_pago > 0 ? <Tag color='success'>
          {convertirMoneda(monto_pago)}
        </Tag> : <Tag color='warning'>
          No realizó el pago
        </Tag>
      ),
      sorter: (a: Usuario, b: Usuario) => (a.monto_pago || 0) - (b.monto_pago || 0),
      responsive: ['md', 'lg', 'xl'],
    },
    {
      title: 'Grupo',
      dataIndex: 'grupo',
      key: 'grupo',
      render: (grupo: string) => (
        <Tag color={getGrupoColor(grupo)}>
          {grupo || 'Sin asignar'}
        </Tag>
      ),
      sorter: (a, b) => (a.grupo || '').localeCompare(b.grupo || ''),
      responsive: ['md', 'lg', 'xl'],
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => (
        <Space size="middle">
          <CopyImageQR userId={record.id} nombre={record.nombre} xs={true} />
          <Button 
            type="dashed"
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Popconfirm
            title="¿Estás seguro de eliminar este usuario?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button 
              type="dashed" 
              danger 
              icon={<DeleteOutlined />} 
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
  ];

  // Renderizar los filtros activos como tags
  const renderFiltrosActivos = () => {
    const tags = [];
    
    if (filtros.genero) {
      tags.push(
        <Tag key="genero" closable onClose={() => setFiltros(prev => ({ ...prev, genero: '' }))}>
          Género: {filtros.genero}
        </Tag>
      );
    }
    
    if (filtros.status) {
      tags.push(
        <Tag key="status" closable onClose={() => setFiltros(prev => ({ ...prev, status: '' }))}>
          Status: {filtros.status}
        </Tag>
      );
    }
    
    if (filtros.grupo) {
      tags.push(
        <Tag key="grupo" closable onClose={() => setFiltros(prev => ({ ...prev, grupo: '' }))}>
          Grupo: {filtros.grupo}
        </Tag>
      );
    }
    
    if (filtros.montoMin !== null || filtros.montoMax !== null) {
      tags.push(
        <Tag key="monto" closable onClose={() => setFiltros(prev => ({ ...prev, montoMin: null, montoMax: null }))}>
          Monto: ${filtros.montoMin || 0} - ${filtros.montoMax || 100000}
        </Tag>
      );
    }
    
    return tags.length > 0 ? (
      <div style={{ marginBottom: 16 }}>
        <span style={{ marginRight: 8 }}>Filtros activos:</span>
        {tags}
        {tags.length > 0 && (
          <Button size="small" onClick={limpiarFiltros} icon={<ClearOutlined />} style={{ marginLeft: 8 }}>
            Limpiar todos
          </Button>
        )}
      </div>
    ) : null;
  };

  return (
        <Card> 
          {/* Agregar el componente NotificacionAlerta */}
          <NotificacionAlerta
            mensaje={alerta.mensaje}
            tipo={alerta.tipo}
            visible={alerta.visible}
            onClose={ocultarAlerta}
            duracion={5000}
          />
          
          <div style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={24} md={12}>
                <Search
                  placeholder="Buscar por nombre"
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="middle"
                  onSearch={handleSearch}
                  style={{ width: '100%' }}
                />
              </Col>
                <Col xs={24} sm={24} md={12} style={{ display: 'flex', justifyContent: isBrowser && isMobile ? 'center' : 'flex-end' }}>
                <Space>
                  <Button 
                    onClick={toggleFiltros}
                    icon={<FilterOutlined />}
                    type={filtrosVisibles ? "primary" : "default"}
                  >
                    Filtros
                  </Button>
                  <Button 
                    type="primary" 
                    icon={<UserAddOutlined />} 
                    onClick={() => setModalCrearVisible(true)}
                  >
                    Agregar Usuario
                  </Button>
                </Space>
              </Col>
            </Row>
          </div>
          
          {filtrosVisibles && (
            <Card style={{ marginBottom: 16 }}>
              <Form
                form={formFiltros}
                layout="vertical"
                onFinish={aplicarFiltros}
                initialValues={{
                  genero: filtros.genero,
                  status: filtros.status,
                  grupo: filtros.grupo,
                  monto_pago: filtros.montoMin !== null && filtros.montoMax !== null ? [filtros.montoMin, filtros.montoMax] : undefined
                }}
              >
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item name="genero" label="Género">
                      <Select placeholder="Selecciona un género" allowClear>
                        {OPCIONES_GENERO.map(opcion => (
                          <Option key={opcion.value} value={opcion.value}>{opcion.label}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="status" label="Status">
                      <Select placeholder="Selecciona un status" allowClear>
                        {OPCIONES_STATUS.map(opcion => (
                          <Option key={opcion.value} value={opcion.value}>{opcion.label}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="grupo" label="Grupo">
                      <Input 
                        placeholder="Ingresa un grupo" 
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="monto_pago" label="Rango de monto pagado">
                      <Slider 
                        range 
                        min={0} 
                        max={100000} 
                        step={1000}
                        tipFormatter={value => `$${value}`}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row justify="end">
                  <Space>
                    <Button onClick={limpiarFiltros}>
                      Limpiar
                    </Button>
                    <Button type="primary" htmlType="submit">
                      Aplicar filtros
                    </Button>
                  </Space>
                </Row>
              </Form>
            </Card>
          )}
          
          {renderFiltrosActivos()}
          
          <Table
            dataSource={usuarios} 
            columns={columnas} 
            rowKey="id" 
            pagination={false}
            loading={loading}
            scroll={{ x: 'max-content' }}
            showSorterTooltip={false}
          />
          
          {/* Componente de paginación personalizado */}
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Pagination
              current={pagination.page}
              pageSize={pagination.pageSize}
              total={pagination.total}
              onChange={handlePageChange}
              showSizeChanger
              pageSizeOptions={['5', '10', '20', '50']}
              showTotal={!isBrowser || !isMobile ? (total, range) => `${range[0]}-${range[1]} de ${total} usuarios` : undefined}
              responsive={true}
              size={isBrowser && isMobile ? "small" : "default"}
            />
          </div>
          
          {/* Modal para editar usuario */}
          {usuarioEditando && (
            <Modal
              title="Editar Usuario"
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
                <Form.Item name="monto_pago" label="Monto Pagado">
                  <Input type="number" />
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
                <Form.Item name="grupo" label="Grupo">
                  <Input placeholder="Ingresa un grupo" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>
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
            title="Agregar Usuario"
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
              <Form.Item name="monto_pago" label="Monto Pagado">
                <Input type="number" />
              </Form.Item>
              <Form.Item name="edad" label="Edad" initialValue={25}>
                <Input type="number" />
              </Form.Item>
              <Form.Item name="status" label="Status" initialValue={OPCIONES_STATUS[0].value} rules={[{ required: true, message: 'Por favor selecciona el status' }]}>
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
              <Form.Item name="grupo" label="Grupo">
                <Input placeholder="Ingresa un grupo" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Crear
                </Button>
                <Button onClick={handleCrearCancel} style={{ marginLeft: '8px' }}>
                  Cancelar
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </Card>
  );
}