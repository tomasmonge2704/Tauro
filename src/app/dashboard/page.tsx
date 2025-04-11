'use client';

import { useState, useEffect } from 'react';
import { Layout, Card, Row, Col, Statistic, Spin, Typography, Alert, Tabs, Collapse } from 'antd';
import { ManOutlined, WomanOutlined, TeamOutlined, CalendarOutlined } from '@ant-design/icons';
import { Pie } from '@ant-design/charts';
import { useTheme } from '@/context/ThemeContext';
import { convertirMoneda } from '../utils/convertirMoneda';

const { Content } = Layout;
const { Text } = Typography;
const { TabPane } = Tabs;

// Interfaz para los datos de estadísticas
interface EstadisticasData {
  generoStats: { Hombre: number; Mujer: number };
  statusStats: { status: string; count: number }[];
  grupoStats: { grupo: string; count: number }[];
  edadPromedio: number;
}

// Interfaz para los datos financieros
interface FinanceData {
  totalUsuarios: number;
  totalRecaudado: number;
  totalPagos: number;
}

interface Botella {
  nombre: string;
  precio: number;
  porcentajeConsumo: number;
  cantidad: number;
  precioTotal: number;
}

export default function DashboardPage() {
  const [estadisticas, setEstadisticas] = useState<EstadisticasData | null>(null);
  const [financeData, setFinanceData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [financeLoading, setFinanceLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [financeError, setFinanceError] = useState<string | null>(null);
  const { themeMode } = useTheme();
  const botellasInicial = [
    {nombre: 'Vodka', precio: 32500, porcentajeConsumo: 0.35, cantidad: 0, precioTotal: 0},
    {nombre: 'Gin', precio: 30875, porcentajeConsumo: 0.40, cantidad: 0, precioTotal: 0},
    {nombre: 'Fernet', precio: 37375, porcentajeConsumo: 0.25, cantidad: 0, precioTotal: 0},
  ];
  const [botellas, setBotellas] = useState<Botella[]>(botellasInicial);
  const [totalBotellas, setTotalBotellas] = useState(0);
  const [cantidadTotalBotellas, setCantidadTotalBotellas] = useState(0);
  const [total_a_pagar, setTotalAPagar] = useState(0);

  useEffect(() => {
    const fetchEstadisticas = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/estadisticas');
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        setEstadisticas(data);
        setError(null);
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        setError('No se pudieron cargar los datos. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchEstadisticas();
  }, []);

  // Obtener datos financieros
  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        setFinanceLoading(true);
        const response = await fetch('/api/estadisticas/finance');
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        setFinanceData(data);
        setFinanceError(null);
      } catch (error) {
        console.error('Error al cargar datos financieros:', error);
        setFinanceError('No se pudieron cargar los datos financieros. Por favor, intenta de nuevo más tarde.');
      } finally {
        setFinanceLoading(false);
      }
    };

    fetchFinanceData();
  }, []);

  // Calcular estadísticas de género
  const usuariosHombres = estadisticas?.generoStats?.Hombre || 0;
  const usuariosMujeres = estadisticas?.generoStats?.Mujer || 0;

  // Calcular porcentajes
  const totalUsuarios = usuariosHombres + usuariosMujeres;
  const porcentajeHombres = totalUsuarios > 0 ? (usuariosHombres / totalUsuarios) * 100 : 0;
  const porcentajeMujeres = totalUsuarios > 0 ? (usuariosMujeres / totalUsuarios) * 100 : 0;
  const totalAlquiler = 3500000;
  const tragosPersona = 5;
  const tragosPorBotella = 15;

  // Efecto para calcular las botellas cuando cambien las estadísticas
  useEffect(() => {
    const calculatedCantidadTotalBotellas = Math.ceil(totalUsuarios * tragosPersona / tragosPorBotella);
    setCantidadTotalBotellas(calculatedCantidadTotalBotellas);
    
    let calculatedTotalBotellas = 0;
    const nuevasBotellas = botellasInicial.map(botella => {
      const cantidadBotellasTipo = Number((calculatedCantidadTotalBotellas * botella.porcentajeConsumo).toFixed(2));
      calculatedTotalBotellas += cantidadBotellasTipo * botella.precio;
      return {
        ...botella,
        cantidad: cantidadBotellasTipo,
        precioTotal: cantidadBotellasTipo * botella.precio
      };
    });
    
    setBotellas(nuevasBotellas);
    setTotalBotellas(calculatedTotalBotellas);
    setTotalAPagar(calculatedTotalBotellas + totalAlquiler);
  }, [totalUsuarios, tragosPersona, tragosPorBotella, totalAlquiler]);

  // Calcular diferencia de porcentaje
  const diferenciaPorcentaje = Math.abs(porcentajeHombres - porcentajeMujeres);

  // Datos para el gráfico de género
  const datosGenero = [
    { type: 'Hombres', value: usuariosHombres },
    { type: 'Mujeres', value: usuariosMujeres },
  ].filter(item => item.value > 0);

  // Configuración del gráfico de género
  const configGenero = {
    appendPadding: 10,
    data: datosGenero,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name}: {percentage}',
    },
    interactions: [{ type: 'element-active' }],
    legend: {
      position: 'bottom' as const,
    },
    theme: themeMode === 'dark' ? 'dark' : 'light',
    color: ['#1677ff', '#ff4d4f'],
  };

  // Renderizar el contenido del tab General
  const renderGeneralContent = () => {
    if (loading) {
      return (
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <Spin size="large" tip="Cargando estadísticas...">
            <div style={{ padding: '50px', background: 'rgba(0,0,0,0.05)' }} />
          </Spin>
        </div>
      );
    }

    if (error) {
      return (
        <div style={{ padding: '24px' }}>
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
          />
        </div>
      );
    }

    return (
      <>
        {/* Tarjetas de estadísticas generales */}
        <Row gutter={[16, 16]} style={{ width: '100%' }}>
          <Col xs={24} sm={24} md={8} lg={8}>
            <Card style={{ width: '100%' }}>
              <Statistic
                title="Total Usuarios"
                value={totalUsuarios}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={24} md={8} lg={8}>
            <Card>
              <Statistic
                title="Edad Promedio"
                value={estadisticas?.edadPromedio || 0}
                prefix={<CalendarOutlined />}
                suffix="años"
              />
            </Card>
          </Col>
          <Col xs={24} sm={24} md={8} lg={8}>
            <Card>
              <Statistic
                title="Hombres / Mujeres"
                value={totalUsuarios}
                formatter={() => (
                  <span>
                    <ManOutlined style={{ color: '#1677ff' }} /> {usuariosHombres}
                    <WomanOutlined style={{ color: '#ff4d4f', marginLeft: '8px' }} /> {usuariosMujeres}
                    <Text style={{ marginLeft: '8px' }}>
                      {diferenciaPorcentaje.toFixed(1)}%
                    </Text>
                  </span>
                )}
              />
            </Card>
          </Col>
        </Row>
        
        {/* Gráficos */}
        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          <Col xs={24}>
            <Card title="Distribución por Género">
              {datosGenero.length > 0 ? (
                <Pie {...configGenero} />
              ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Text type="secondary">No hay datos suficientes</Text>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </>
    );
  };

  // Renderizar el contenido del tab de Reporte Financiero
  const renderFinanceContent = () => {
    if (financeLoading) {
      return (
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <Spin size="large" tip="Cargando datos financieros...">
            <div style={{ padding: '50px', background: 'rgba(0,0,0,0.05)' }} />
          </Spin>
        </div>
      );
    }

    if (financeError) {
      return (
        <div style={{ padding: '24px' }}>
          <Alert
            message="Error"
            description={financeError}
            type="error"
            showIcon
          />
        </div>
      );
    }

    return (
      <>
        <Row gutter={[16, 16]} style={{ width: '100%' }}>
          <Col xs={12} sm={6}>
            <Card style={{ height: '100%' }}>
              <Statistic
                title="Total Usuarios"
                value={totalUsuarios}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Total Pagos Registrados"
                value={financeData?.totalPagos || 0}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Total Recaudado"
                value={convertirMoneda(financeData?.totalRecaudado || 0)}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Total a Recaudar"
                value={convertirMoneda(total_a_pagar)}
              />
            </Card>
          </Col>
        </Row>
        
        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          <Col xs={24}>
            <Card title="Resumen Financiero">
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <Statistic
                  title="Balance"
                  value={(financeData?.totalRecaudado || 0) - total_a_pagar}
                  precision={2}
                  valueStyle={{ 
                    color: (financeData?.totalRecaudado || 0) > total_a_pagar ? '#3f8600' : '#cf1322' 
                  }}
                  prefix={(financeData?.totalRecaudado || 0) > total_a_pagar ? 
                    <span>+</span> : <span>-</span>}
                  formatter={(value) => convertirMoneda(Math.abs(Number(value)))}
                />
                <Text style={{ display: 'block', marginTop: '10px' }}>
                  {(financeData?.totalRecaudado || 0) > total_a_pagar ? 
                    'Recaudación superior a lo necesario' : 
                    'Recaudación inferior a lo necesario'}
                </Text>
                
                {/* Descripción del cálculo del total a recaudar */}
                <div style={{ marginTop: '20px', textAlign: 'left', background: 'rgba(0,0,0,0.02)', padding: '20px', borderRadius: '8px' }}>                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                      <Text>Cantidad de botellas</Text>
                      <Text>
                        {cantidadTotalBotellas}
                      </Text>
                    </div>

                    <div style={{ padding: '8px 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text>Costo de botellas</Text>
                        <Text>{convertirMoneda(totalBotellas)}</Text>
                      </div>
                      <Collapse ghost>
                        <Collapse.Panel key="1" header={<div style={{ textAlign: 'right' }}><small>Ver detalle</small></div>} style={{ padding: 0 }}>
                          <div style={{ padding: '10px', background: 'rgba(0,0,0,0.02)', borderRadius: '4px', marginTop: '5px' }}>
                            {botellas.map((botella, index) => {
                              return (
                                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0' }}>
                                  <Text>{botella.nombre} ({botella.cantidad} unidades)</Text>
                                  <Text>{convertirMoneda(botella.precioTotal)}</Text>
                                </div>
                              );
                            })}
                          </div>
                        </Collapse.Panel>
                      </Collapse>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                      <Text>Costo de alquiler</Text>
                      <Text strong>{convertirMoneda(totalAlquiler)}</Text>
                    </div>
                    
                    <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)' }} />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', marginTop: '5px', background: 'rgba(0,0,0,0.03)', borderRadius: '4px' }}>
                      <Text strong>Total a recaudar</Text>
                      <Text strong style={{ fontSize: '16px' }}>
                        {convertirMoneda(total_a_pagar)}
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </>
    );
  };
  
  return (
    <Content style={{ padding: '16px' }}>
      <Tabs defaultActiveKey="general" size="large">
        <TabPane tab="General" key="general">
          {renderGeneralContent()}
        </TabPane>
        <TabPane tab="Reporte Financiero" key="finance">
          {renderFinanceContent()}
        </TabPane>
      </Tabs>
      
      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <Text type="secondary">
          Última actualización: {new Date().toLocaleString()}
        </Text>
      </div>
    </Content>
  );
}
