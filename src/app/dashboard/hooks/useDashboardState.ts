import { useState, useEffect, useMemo } from 'react';

interface EstadisticasData {
  generoStats: { Hombre: number; Mujer: number };
  statusStats: { status: string; count: number }[];
  grupoStats: { grupo: string; count: number }[];
  creationDates: { id: number | string; created_at: string }[];
  edadPromedio: number;
}

interface FinanceData {
  totalUsuarios: number;
  totalRecaudado: number;
  totalPagos: number;
  entradaPromedio: number;
}

interface Botella {
  nombre: string;
  precio: number;
  porcentajeConsumo: number;
  cantidad: number;
  precioTotal: number;
}

interface DashboardState {
  // Datos de la API
  estadisticas: EstadisticasData | null;
  financeData: FinanceData | null;
  
  // Estados de carga y error
  loading: boolean;
  financeLoading: boolean;
  error: string | null;
  financeError: string | null;
  
  // Datos editables
  editableTotalUsuarios: number;
  editableTotalPagos: number;
  editableBotellas: Botella[];
  editableTotalAlquiler: number;
  editableEntradaPromedio: number;
}

interface DashboardCalculations {
  // Cálculos basados en estadísticas
  usuariosHombres: number;
  usuariosMujeres: number;
  totalUsuarios: number;
  porcentajeHombres: number;
  porcentajeMujeres: number;
  diferenciaPorcentaje: number;
  
  // Cálculos financieros
  totalBotellas: number;
  cantidadTotalBotellas: number;
  costoBotellaPorPersona: number;
  totalAPagar: number;
  balance: number;
  
  // Cálculos para proyecciones
  totalRecaudadoProyectado: number;
  esProyeccion: boolean;
  entradaPromedio: number;
}

const botellasInicial = [
  {nombre: 'Vodka', precio: 30000, porcentajeConsumo: 0.35, cantidad: 0, precioTotal: 0},
  {nombre: 'Gin', precio: 28500, porcentajeConsumo: 0.40, cantidad: 0, precioTotal: 0},
  {nombre: 'Fernet', precio: 34500, porcentajeConsumo: 0.25, cantidad: 0, precioTotal: 0},
];

const totalAlquiler = 3500000;
const tragosPersona = 4;
const tragosPorBotella = 15;

export const useDashboardState = () => {
  // Estado base
  const [state, setState] = useState<DashboardState>({
    estadisticas: null,
    financeData: null,
    loading: true,
    financeLoading: true,
    error: null,
    financeError: null,
    editableTotalUsuarios: 0,
    editableTotalPagos: 0,
    editableBotellas: botellasInicial,
    editableTotalAlquiler: totalAlquiler,
    editableEntradaPromedio: 0,
  });

  // Cálculos derivados
  const calculations = useMemo<DashboardCalculations>(() => {
    const usuariosHombres = state.estadisticas?.generoStats?.Hombre || 0;
    const usuariosMujeres = state.estadisticas?.generoStats?.Mujer || 0;
    const totalUsuarios = usuariosHombres + usuariosMujeres;
    const porcentajeHombres = totalUsuarios > 0 ? (usuariosHombres / totalUsuarios) * 100 : 0;
    const porcentajeMujeres = totalUsuarios > 0 ? (usuariosMujeres / totalUsuarios) * 100 : 0;
    const diferenciaPorcentaje = Math.abs(porcentajeHombres - porcentajeMujeres);

    const totalBotellas = state.editableBotellas.reduce((total, botella) => total + botella.precioTotal, 0);
    const cantidadTotalBotellas = state.editableBotellas.reduce((total, botella) => total + botella.cantidad, 0);
    const costoBotellaPorPersona = totalBotellas / (state.editableTotalPagos || 1);

    // Cálculos para proyecciones
    const entradaPromedio = state.editableEntradaPromedio || state.financeData?.entradaPromedio || 0;
    const totalRecaudadoActual = state.financeData?.totalRecaudado || 0;
    const totalPagosOriginales = state.financeData?.totalPagos || 0;
    
    // Si estamos en modo proyección (los valores editables son diferentes a los originales)
    const esProyeccion = state.editableTotalPagos !== totalPagosOriginales || 
                        state.editableTotalUsuarios !== totalUsuarios ||
                        state.editableEntradaPromedio !== (state.financeData?.entradaPromedio || 0);

    let totalRecaudadoProyectado = totalRecaudadoActual;
    if (esProyeccion) {
      // Si hay más pagos que los originales, calculamos el ingreso adicional
      const pagosDiferencia = state.editableTotalPagos - totalPagosOriginales;
      if (pagosDiferencia > 0) {
        totalRecaudadoProyectado += pagosDiferencia * entradaPromedio;
      }
    }

    const totalAPagar = totalBotellas + state.editableTotalAlquiler;
    const balance = totalRecaudadoProyectado - totalAPagar;

    return {
      usuariosHombres,
      usuariosMujeres,
      totalUsuarios,
      porcentajeHombres,
      porcentajeMujeres,
      diferenciaPorcentaje,
      totalBotellas,
      cantidadTotalBotellas,
      costoBotellaPorPersona,
      totalAPagar,
      balance,
      totalRecaudadoProyectado,
      esProyeccion,
      entradaPromedio,
    };
  }, [state.estadisticas, state.financeData, state.editableBotellas, state.editableTotalUsuarios, state.editableTotalPagos, state.editableTotalAlquiler, state.editableEntradaPromedio]);

  // Efectos para cargar datos
  useEffect(() => {
    const fetchEstadisticas = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        const response = await fetch('/api/estadisticas');
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        setState(prev => ({ ...prev, estadisticas: data, error: null }));
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        setState(prev => ({ ...prev, error: 'No se pudieron cargar los datos. Por favor, intenta de nuevo más tarde.' }));
      } finally {
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    fetchEstadisticas();
  }, []);

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        setState(prev => ({ ...prev, financeLoading: true }));
        const response = await fetch('/api/estadisticas/finance');
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        setState(prev => ({ ...prev, financeData: data, financeError: null }));
      } catch (error) {
        console.error('Error al cargar datos financieros:', error);
        setState(prev => ({ ...prev, financeError: 'No se pudieron cargar los datos financieros. Por favor, intenta de nuevo más tarde.' }));
      } finally {
        setState(prev => ({ ...prev, financeLoading: false }));
      }
    };

    fetchFinanceData();
  }, []);

  // Función para calcular las botellas basado en el total de usuarios
  const calcularBotellas = (totalUsuarios: number) => {
    const preTotalBotellas = Math.ceil(totalUsuarios * tragosPersona / tragosPorBotella);
    return state.editableBotellas.map(botella => {
      const cantidadBotellasTipo = Math.ceil(preTotalBotellas * botella.porcentajeConsumo);
      return {
        ...botella,
        cantidad: cantidadBotellasTipo,
        precioTotal: cantidadBotellasTipo * botella.precio
      };
    });
  };

  // Funciones para actualizar el estado editable
  const updateEditableTotalUsuarios = (value: number) => {
    const nuevasBotellas = calcularBotellas(value);
    setState(prev => ({ 
      ...prev, 
      editableTotalUsuarios: value,
      editableBotellas: nuevasBotellas
    }));
  };

  const updateEditableTotalPagos = (value: number) => {
    setState(prev => ({ ...prev, editableTotalPagos: value }));
  };

  const updateEditableTotalAlquiler = (value: number) => {
    setState(prev => ({ ...prev, editableTotalAlquiler: value }));
  };

  const updateEditableBotellas = (newBotellas: Botella[]) => {
    setState(prev => ({ ...prev, editableBotellas: newBotellas }));
  };

  const updateEditableEntradaPromedio = (value: number) => {
    setState(prev => ({ ...prev, editableEntradaPromedio: value }));
  };

  const handleBotellaChange = (index: number, field: keyof Botella, value: number | string) => {
    const nuevasBotellas = [...state.editableBotellas];
    const newValue = field === 'nombre' ? value : Number(value);
    
    nuevasBotellas[index] = {
      ...nuevasBotellas[index],
      [field]: newValue,
    };

    // Si cambia el porcentaje de consumo, recalcular cantidades
    if (field === 'porcentajeConsumo') {
      const preTotalBotellas = Math.ceil(state.editableTotalUsuarios * tragosPersona / tragosPorBotella);
      nuevasBotellas[index].cantidad = Math.ceil(preTotalBotellas * Number(value));
      nuevasBotellas[index].precioTotal = nuevasBotellas[index].cantidad * nuevasBotellas[index].precio;
    }
    // Si cambia la cantidad o el precio, actualizar solo el precio total
    else if (field === 'cantidad' || field === 'precio') {
      nuevasBotellas[index].precioTotal = nuevasBotellas[index].cantidad * nuevasBotellas[index].precio;
    }

    updateEditableBotellas(nuevasBotellas);
  };

  const handleAddBotella = () => {
    updateEditableBotellas([
      ...state.editableBotellas,
      { nombre: 'Nueva Botella', precio: 0, porcentajeConsumo: 0, cantidad: 0, precioTotal: 0 }
    ]);
  };

  const handleRemoveBotella = (index: number) => {
    const nuevasBotellas = state.editableBotellas.filter((_, i) => i !== index);
    updateEditableBotellas(nuevasBotellas);
  };

  // Efecto para actualizar los valores editables cuando cambian los datos
  useEffect(() => {
    if (state.financeData && state.estadisticas) {
      const totalUsuarios = state.estadisticas.generoStats.Hombre + state.estadisticas.generoStats.Mujer;
      const nuevasBotellas = calcularBotellas(totalUsuarios);

      setState(prev => ({
        ...prev,
        editableTotalUsuarios: totalUsuarios,
        editableTotalPagos: state.financeData?.totalPagos || 0,
        editableBotellas: nuevasBotellas,
        editableEntradaPromedio: state.financeData?.entradaPromedio || 0,
      }));
    }
  }, [state.financeData, state.estadisticas]);

  return {
    state,
    calculations,
    updateEditableTotalUsuarios,
    updateEditableTotalPagos,
    updateEditableTotalAlquiler,
    updateEditableBotellas,
    updateEditableEntradaPromedio,
    handleBotellaChange,
    handleAddBotella,
    handleRemoveBotella,
  };
}; 