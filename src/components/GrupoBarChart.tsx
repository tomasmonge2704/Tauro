import React from 'react';
import { Column } from '@ant-design/charts';
import { Card, Empty } from 'antd';
import { useTheme } from '@/context/ThemeContext';

interface GrupoBarChartProps {
  data: Array<{ grupo: string; count: number }>;
  loading?: boolean;
}

const GrupoBarChart: React.FC<GrupoBarChartProps> = ({ data, loading }) => {
  const { themeMode } = useTheme();

  if (!data || data.length === 0) {
    return (
      <Card title="Distribución por Grupo" style={{ height: '100%' }}>
        <Empty description="No hay datos disponibles" />
      </Card>
    );
  }
  // Configuración del gráfico de barras
  const config = {
    data,
    xField: 'grupo',
    yField: 'count',
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    meta: {
      grupo: { alias: 'Grupo' },
      count: { alias: 'Cantidad de Usuarios' },
    },
    color: '#1677ff',
    theme: themeMode === 'dark' ? 'dark' : 'light',
  };

  return (
    <Card title="Distribución por Grupo" loading={loading} style={{ height: '100%' }}>
      <Column {...config} />
    </Card>
  );
};

export default GrupoBarChart; 