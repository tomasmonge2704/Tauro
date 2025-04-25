'use client';

import { Layout, Card, Row, Col, Statistic, Spin, Typography, Alert, Tabs, Collapse, InputNumber, Input, Button } from 'antd';
import { ManOutlined, WomanOutlined, TeamOutlined, CalendarOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Pie } from '@ant-design/charts';
import { useTheme } from '@/context/ThemeContext';
import { convertirMoneda } from '../utils/convertirMoneda';
import GrupoBarChart from '@/components/GrupoBarChart';
import CrecimientoUsuariosChart from '@/components/CrecimientoUsuariosChart';
import { useDashboardState } from './hooks/useDashboardState';

const { Content } = Layout;
const { Text } = Typography;
const { TabPane } = Tabs;

export default function DashboardPage() {
  const { themeMode } = useTheme();
  const {
    state,
    calculations,
    updateEditableTotalUsuarios,
    updateEditableTotalPagos,
    updateEditableTotalAlquiler,
    handleBotellaChange,
    handleAddBotella,
    handleRemoveBotella,
  } = useDashboardState();

  // Configuración del gráfico de género
  const configGenero = {
    appendPadding: 10,
    data: [
      { type: 'Hombres', value: calculations.usuariosHombres },
      { type: 'Mujeres', value: calculations.usuariosMujeres },
    ].filter(item => item.value > 0),
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
    if (state.loading) {
      return (
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <Spin size="large" tip="Cargando estadísticas...">
            <div style={{ padding: '50px', background: 'rgba(0,0,0,0.05)' }} />
          </Spin>
        </div>
      );
    }

    if (state.error) {
      return (
        <div style={{ padding: '24px' }}>
          <Alert
            message="Error"
            description={state.error}
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
                value={calculations.totalUsuarios}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={24} md={8} lg={8}>
            <Card>
              <Statistic
                title="Edad Promedio"
                value={state.estadisticas?.edadPromedio || 0}
                prefix={<CalendarOutlined />}
                suffix="años"
              />
            </Card>
          </Col>
          <Col xs={24} sm={24} md={8} lg={8}>
            <Card>
              <Statistic
                title="Hombres / Mujeres"
                value={calculations.totalUsuarios}
                formatter={() => (
                  <span>
                    <ManOutlined style={{ color: '#1677ff' }} /> {calculations.usuariosHombres}
                    <WomanOutlined style={{ color: '#ff4d4f', marginLeft: '8px' }} /> {calculations.usuariosMujeres}
                    <Text style={{ marginLeft: '8px' }}>
                      {calculations.diferenciaPorcentaje.toFixed(1)}%
                    </Text>
                  </span>
                )}
              />
            </Card>
          </Col>
        </Row>
        
        {/* Gráficos de distribución */}
        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          <Col xs={24} md={12}>
            <Card title="Distribución por Género">
              {configGenero.data.length > 0 ? (
                <Pie {...configGenero} />
              ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Text type="secondary">No hay datos suficientes</Text>
                </div>
              )}
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <GrupoBarChart data={state.estadisticas?.grupoStats || []} loading={state.loading} />
          </Col>
        </Row>

        {/* Gráfico de crecimiento */}
        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          <Col xs={24}>
            <CrecimientoUsuariosChart 
              data={state.estadisticas?.creationDates || []} 
              loading={state.loading} 
            />
          </Col>
        </Row>
      </>
    );
  };

  // Renderizar el contenido del tab de Reporte Financiero
  const renderFinanceContent = () => {
    if (state.financeLoading) {
      return (
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <Spin size="large" tip="Cargando datos financieros...">
            <div style={{ padding: '50px', background: 'rgba(0,0,0,0.05)' }} />
          </Spin>
        </div>
      );
    }

    if (state.financeError) {
      return (
        <div style={{ padding: '24px' }}>
          <Alert
            message="Error"
            description={state.financeError}
            type="error"
            showIcon
          />
        </div>
      );
    }

    return (
      <>
        <Row gutter={[16, 16]} style={{ width: '100%' }}>
          <Col xs={12} sm={4}>
            <Card style={{ height: '100%' }}>
              <Statistic
                title="Total Usuarios"
                value={calculations.totalUsuarios}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={4}>
            <Card>
              <Statistic
                title="Total Pagos Registrados"
                value={state.financeData?.totalPagos || 0}
              />
            </Card>
          </Col>
          <Col xs={24} sm={5}>
            <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Statistic
                title="Entrada Promedio"
                value={convertirMoneda(state.financeData?.entradaPromedio || 0)}
              />
            </Card>
          </Col>
          <Col xs={24} sm={5}>
            <Card>
              <Statistic
                title="Total Recaudado"
                value={convertirMoneda(state.financeData?.totalRecaudado || 0)}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Total a Recaudar"
                value={convertirMoneda(calculations.totalAPagar)}
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
                  value={calculations.balance}
                  precision={2}
                  valueStyle={{ 
                    color: calculations.balance > 0 ? '#3f8600' : '#cf1322' 
                  }}
                  prefix={calculations.balance > 0 ? 
                    <span>+</span> : <span>-</span>}
                  formatter={(value) => convertirMoneda(Math.abs(Number(value)))}
                />
                <Text style={{ display: 'block', marginTop: '10px' }}>
                  {calculations.balance > 0 ? 
                    'Recaudación superior a lo necesario' : 
                    'Recaudación inferior a lo necesario'}
                </Text>
                
                {/* Descripción del cálculo del total a recaudar */}
                <div style={{ marginTop: '20px', textAlign: 'left', background: 'rgba(0,0,0,0.02)', padding: '20px', borderRadius: '8px' }}>                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                      <Text>Cantidad de botellas</Text>
                      <Text>
                        {calculations.cantidadTotalBotellas}
                      </Text>
                    </div>
                    <div style={{ padding: '8px 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text>Costo unitario de botella por persona</Text>
                        <Text>{convertirMoneda(calculations.costoBotellaPorPersona)}</Text>
                      </div>
                    </div>
                    <div style={{ padding: '8px 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text>Costo de botellas</Text>
                        <Text>{convertirMoneda(calculations.totalBotellas)}</Text>
                      </div>
                      <Collapse ghost>
                        <Collapse.Panel key="1" header={<div style={{ textAlign: 'right' }}><small>Ver detalle</small></div>} style={{ padding: 0 }}>
                          <div style={{ padding: '10px', background: 'rgba(0,0,0,0.02)', borderRadius: '4px', marginTop: '5px' }}>
                            {state.editableBotellas.map((botella, index) => {
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
                      <Text strong>{convertirMoneda(state.editableTotalAlquiler)}</Text>
                    </div>
                    
                    <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)' }} />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', marginTop: '5px', background: 'rgba(0,0,0,0.03)', borderRadius: '4px' }}>
                      <Text strong>Total a recaudar</Text>
                      <Text strong style={{ fontSize: '16px' }}>
                        {convertirMoneda(calculations.totalAPagar)}
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

  // Renderizar el contenido del tab de Proyección de ingresos
  const renderProyeccionContent = () => {
    if (state.financeLoading) {
      return (
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <Spin size="large" tip="Cargando datos financieros...">
            <div style={{ padding: '50px', background: 'rgba(0,0,0,0.05)' }} />
          </Spin>
        </div>
      );
    }

    if (state.financeError) {
      return (
        <div style={{ padding: '24px' }}>
          <Alert
            message="Error"
            description={state.financeError}
            type="error"
            showIcon
          />
        </div>
      );
    }

    const calcularTotalBotellas = () => {
      return state.editableBotellas.reduce((total, botella) => total + botella.precioTotal, 0);
    };

    const calcularTotalAPagar = () => {
      return calcularTotalBotellas() + state.editableTotalAlquiler;
    };

    return (
      <>
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24}>
            <Card title="Gestión de Botellas">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {state.editableBotellas.map((botella, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    gap: '16px', 
                    alignItems: 'center',
                    padding: '16px',
                    background: 'rgba(0,0,0,0.02)',
                    borderRadius: '8px'
                  }}>
                    <Input
                      placeholder="Nombre de la botella"
                      value={botella.nombre}
                      onChange={(e) => {
                        const nuevasBotellas = [...state.editableBotellas];
                        nuevasBotellas[index].nombre = e.target.value;
                        handleBotellaChange(index, 'nombre', e.target.value);
                      }}
                      style={{ width: '200px' }}
                    />
                    <InputNumber
                      addonBefore="Precio"
                      value={botella.precio}
                      onChange={(value) => handleBotellaChange(index, 'precio', value || 0)}
                      min={0}
                      style={{ width: '150px' }}
                    />
                    <InputNumber
                      addonBefore="% Consumo"
                      value={botella.porcentajeConsumo}
                      onChange={(value) => handleBotellaChange(index, 'porcentajeConsumo', value || 0)}
                      min={0}
                      max={1}
                      step={0.1}
                      style={{ width: '150px' }}
                    />
                    <InputNumber
                      addonBefore="Cantidad"
                      value={botella.cantidad}
                      onChange={(value) => handleBotellaChange(index, 'cantidad', value || 0)}
                      min={0}
                      style={{ width: '150px' }}
                    />
                    <Text strong style={{ minWidth: '100px' }}>
                      Total: {convertirMoneda(botella.precioTotal)}
                    </Text>
                    <Button 
                      type="primary" 
                      danger 
                      onClick={() => handleRemoveBotella(index)}
                      icon={<DeleteOutlined />}
                    />
                  </div>
                ))}
                <Button 
                  type="dashed" 
                  onClick={handleAddBotella}
                  icon={<PlusOutlined />}
                  style={{ width: '100%' }}
                >
                  Agregar Botella
                </Button>
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ width: '100%' }}>
          <Col xs={12} sm={4}>
            <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '100%' }}>
                <Text>Total Usuarios</Text>
                <InputNumber
                  value={state.editableTotalUsuarios}
                  onChange={(value) => updateEditableTotalUsuarios(value || 0)}
                  min={0}
                  style={{ width: '100%' }}
                />
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={4}>
            <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '100%' }}>
                <Text>Total Pagos Registrados</Text>
                <InputNumber
                  value={state.editableTotalPagos}
                  onChange={(value) => updateEditableTotalPagos(value || 0)}
                  min={0}
                  style={{ width: '100%' }}
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={5}>
            <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Statistic
                title="Entrada Promedio"
                value={convertirMoneda(state.financeData?.entradaPromedio || 0)}
              />
            </Card>
          </Col>
          <Col xs={24} sm={5}>
            <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Statistic
                title={calculations.esProyeccion ? "Total Recaudado Proyectado" : "Total Recaudado"}
                value={convertirMoneda(calculations.esProyeccion ? calculations.totalRecaudadoProyectado : state.financeData?.totalRecaudado || 0)}
                valueStyle={{ 
                  color: calculations.esProyeccion ? '#1677ff' : undefined 
                }}
              />
              {calculations.esProyeccion && (
                <Text type="secondary" style={{ display: 'block', fontSize: '12px', marginTop: '8px' }}>
                  Basado en un promedio de {convertirMoneda(calculations.entradaPromedio)} por persona
                </Text>
              )}
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Statistic
                title="Total a Recaudar"
                value={convertirMoneda(calcularTotalAPagar())}
              />
            </Card>
          </Col>
        </Row>
        
        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          <Col xs={24}>
            <Card title="Resumen Financiero">
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <Statistic
                  title="Balance Proyectado"
                  value={calculations.balance}
                  precision={2}
                  valueStyle={{ 
                    color: calculations.balance > 0 ? '#3f8600' : '#cf1322',
                    ...(calculations.esProyeccion && { fontStyle: 'italic' })
                  }}
                  prefix={calculations.balance > 0 ? 
                    <span>+</span> : <span>-</span>}
                  formatter={(value) => convertirMoneda(Math.abs(Number(value)))}
                />
                <Text style={{ display: 'block', marginTop: '10px' }}>
                  {calculations.balance > 0 ? 
                    'Recaudación proyectada superior a lo necesario' : 
                    'Recaudación proyectada inferior a lo necesario'}
                </Text>
                
                <div style={{ marginTop: '20px', textAlign: 'left', background: 'rgba(0,0,0,0.02)', padding: '20px', borderRadius: '8px' }}>                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                      <Text>Cantidad de botellas</Text>
                      <Text>
                        {state.editableBotellas.reduce((total, botella) => total + botella.cantidad, 0)}
                      </Text>
                    </div>
                    <div style={{ padding: '8px 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text>Costo unitario de botella por persona</Text>
                        <Text>{convertirMoneda(calcularTotalBotellas() / (state.editableTotalPagos || 1))}</Text>
                      </div>
                    </div>
                    <div style={{ padding: '8px 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text>Costo de botellas</Text>
                        <Text>{convertirMoneda(calcularTotalBotellas())}</Text>
                      </div>
                      <Collapse ghost>
                        <Collapse.Panel key="1" header={<div style={{ textAlign: 'right' }}><small>Ver detalle</small></div>} style={{ padding: 0 }}>
                          <div style={{ padding: '10px', background: 'rgba(0,0,0,0.02)', borderRadius: '4px', marginTop: '5px' }}>
                            {state.editableBotellas.map((botella, index) => {
                              return (
                                <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '5px 0' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Text>{botella.nombre}</Text>
                                    <Text>{convertirMoneda(botella.precioTotal)}</Text>
                                  </div>
                                  <div style={{ display: 'flex', gap: '8px' }}>
                                    <InputNumber
                                      addonBefore="Cantidad"
                                      value={botella.cantidad}
                                      onChange={(value) => handleBotellaChange(index, 'cantidad', value || 0)}
                                      min={0}
                                      style={{ width: '100%' }}
                                    />
                                    <InputNumber
                                      addonBefore="Precio"
                                      value={botella.precio}
                                      onChange={(value) => handleBotellaChange(index, 'precio', value || 0)}
                                      min={0}
                                      style={{ width: '100%' }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </Collapse.Panel>
                      </Collapse>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                      <Text>Costo de alquiler</Text>
                      <InputNumber
                        value={state.editableTotalAlquiler}
                        onChange={(value) => updateEditableTotalAlquiler(value || 0)}
                        min={0}
                        style={{ width: '200px' }}
                        formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => Number(value!.replace(/\$\s?|(,*)/g, ''))}
                      />
                    </div>
                    
                    <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)' }} />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', marginTop: '5px', background: 'rgba(0,0,0,0.03)', borderRadius: '4px' }}>
                      <Text strong>Total a recaudar</Text>
                      <Text strong style={{ fontSize: '16px' }}>
                        {convertirMoneda(calcularTotalAPagar())}
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
        <TabPane tab="Proyección de ingresos" key="proyeccion">
          {renderProyeccionContent()}
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
