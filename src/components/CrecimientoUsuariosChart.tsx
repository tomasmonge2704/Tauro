import React from 'react';
import { Area } from '@ant-design/charts';
import { Card, Empty } from 'antd';
import { useTheme } from '@/context/ThemeContext';
import moment from 'moment';

interface CrecimientoUsuariosProps {
  data: Array<{id: number | string, created_at: string}>;
  loading?: boolean;
}

const CrecimientoUsuariosChart: React.FC<CrecimientoUsuariosProps> = ({ data, loading }) => {
  const { themeMode } = useTheme();
  
  // Procesar los datos y calcular estadísticas de crecimiento
  const formattedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Determinar el año de los datos
    const año = data.length > 0 ? moment(data[0].created_at).year() : 2025;
    
    // Obtener el rango de fechas para abril del año correspondiente
    const inicioAbril = moment(`${año}-04-01`);
    const finAbril = moment(`${año}-04-30`).endOf('day');
    
    console.log("Rango de fechas:", inicioAbril.format('YYYY-MM-DD'), "a", finAbril.format('YYYY-MM-DD'));
    
    // Crear un mapa para contar usuarios por día
    const usuariosPorDia: Record<string, number> = {};
    
    // Inicializar todas las fechas de abril
    const fechasAbril: moment.Moment[] = [];
    for (let d = moment(inicioAbril); d.isSameOrBefore(finAbril); d.add(1, 'day')) {
      const fechaKey = d.format('YYYY-MM-DD');
      usuariosPorDia[fechaKey] = 0;
      fechasAbril.push(moment(d));
    }
    
    // Contar usuarios nuevos por día
    data.forEach(user => {
      const fechaCreacion = moment(user.created_at);
      // Solo considerar usuarios creados en abril del año correspondiente
      if (fechaCreacion.isSameOrAfter(inicioAbril) && fechaCreacion.isSameOrBefore(finAbril)) {
        const fechaKey = fechaCreacion.format('YYYY-MM-DD');
        usuariosPorDia[fechaKey] = (usuariosPorDia[fechaKey] || 0) + 1;
      }
    });
    
    // Calcular el total acumulado para cada día
    let totalAcumulado = data.filter(user => 
      moment(user.created_at).isBefore(inicioAbril)
    ).length;
    
    // Crear los datos formateados para el gráfico
    const result: Array<{fecha: string, value: number, category: string}> = [];
    
    // Agregar datos para cada día de abril
    fechasAbril.forEach(fecha => {
      const fechaKey = fecha.format('YYYY-MM-DD');
      const nuevosDia = usuariosPorDia[fechaKey] || 0;
      totalAcumulado += nuevosDia;
      
      const fechaFormateada = fecha.format('DD MMM');
      
      // Agregar datos de nuevos usuarios
      result.push({
        fecha: fechaFormateada,
        value: nuevosDia,
        category: 'Nuevos Usuarios'
      });
      
      // Agregar datos de total acumulado
      result.push({
        fecha: fechaFormateada,
        value: totalAcumulado,
        category: 'Total Acumulado'
      });
    });
    
    // Verificamos si tenemos datos para mostrar
    console.log("Total de datos procesados:", result.length, "Datos por día:", Object.keys(usuariosPorDia).length);
    
    return result;
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <Card title="Crecimiento de Usuarios - Abril 2025" style={{ width: '100%' }}>
        <Empty description="No hay datos disponibles" />
      </Card>
    );
  }

  // Verificar si tenemos datos formateados
  if (formattedData.length === 0) {
    return (
      <Card title="Crecimiento de Usuarios - Abril 2025" style={{ width: '100%' }}>
        <Empty description="No hay datos para mostrar en el rango de abril" />
      </Card>
    );
  }

  // Configuración del gráfico de área
  const config = {
    data: formattedData,
    xField: 'fecha',
    yField: ['value'],
    seriesField: 'category',
    smooth: true,
    areaStyle: {
      fillOpacity: 0.6,
    },
    meta: {
      value: {
        alias: 'Usuarios',
        max: 450
      },
    },
    color: ['#52c41a', '#1677ff'],
    theme: themeMode === 'dark' ? 'dark' : 'light',
    scale: {
      value: {
        min: 0,
        max: 450
      }
    },
    axis: {
      y: { 
        tickCount: 5,
        nice: true
      }
    }
  };

  // Determinar el año de los datos
  const año = data.length > 0 ? moment(data[0].created_at).year() : 2025;

  return (
    <Card 
      title={`Crecimiento de Usuarios - Abril ${año}`} 
      loading={loading} 
      style={{ width: '100%' }}
    >
      <Area {...config} />
    </Card>
  );
};

export default CrecimientoUsuariosChart; 