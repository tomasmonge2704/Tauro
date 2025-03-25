'use client';

import { useState, useEffect } from 'react';
import { Layout, Card, Row, Col, Statistic, Spin, Typography, Alert } from 'antd';
import { ManOutlined, WomanOutlined, TeamOutlined, CalendarOutlined } from '@ant-design/icons';
import { Pie } from '@ant-design/charts';
import { useTheme } from '@/context/ThemeContext';

const { Content } = Layout;
const { Text } = Typography;

// Interfaz para los datos de estadísticas
interface EstadisticasData {
  totalUsuarios: number;
  generoStats: { Hombre: number; Mujer: number };
  statusStats: { status: string; count: number }[];
  grupoStats: { grupo: string; count: number }[];
  edadPromedio: number;
}

export default function DashboardPage() {
  const [estadisticas, setEstadisticas] = useState<EstadisticasData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { themeMode } = useTheme();

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

  // Calcular estadísticas de género
  const usuariosHombres = estadisticas?.generoStats?.Hombre || 0;
  const usuariosMujeres = estadisticas?.generoStats?.Mujer || 0;

  // Calcular porcentajes
  const totalUsuarios = usuariosHombres + usuariosMujeres;
  const porcentajeHombres = totalUsuarios > 0 ? (usuariosHombres / totalUsuarios) * 100 : 0;
  const porcentajeMujeres = totalUsuarios > 0 ? (usuariosMujeres / totalUsuarios) * 100 : 0;

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
    color: ['#1677ff', '#ff4d4f', '#722ed1', '#faad14'],
  };

  if (loading) {
    return (
      <Content style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" tip="Cargando estadísticas...">
          <div style={{ padding: '50px', background: 'rgba(0,0,0,0.05)' }} />
        </Spin>
      </Content>
    );
  }

  if (error) {
    return (
      <Content style={{ padding: '24px' }}>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
        />
      </Content>
    );
  }

  return (
    <Content>
      {/* Tarjetas de estadísticas generales */}
      <Row gutter={[16, 16]} style={{ width: '100%' }}>
        <Col xs={24} sm={24} md={8} lg={8}>
          <Card style={{ width: '100%' }}>
            <Statistic
              title="Total Usuarios"
              value={estadisticas?.totalUsuarios || 0}
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
            
      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <Text type="secondary">
          Última actualización: {new Date().toLocaleString()}
        </Text>
      </div>
    </Content>
  );
}
