import { useState } from 'react';
import { TipoAlerta } from '@/components/NotificacionAlerta';

interface EstadoAlerta {
  visible: boolean;
  mensaje: string;
  tipo: TipoAlerta;
}

const useAlerta = () => {
  const [alerta, setAlerta] = useState<EstadoAlerta>({
    visible: false,
    mensaje: '',
    tipo: 'exito'
  });

  const mostrarExito = (mensaje: string) => {
    setAlerta({
      visible: true,
      mensaje,
      tipo: 'exito'
    });
  };

  const mostrarError = (mensaje: string) => {
    setAlerta({
      visible: true,
      mensaje,
      tipo: 'error'
    });
  };

  const ocultarAlerta = () => {
    setAlerta(prev => ({
      ...prev,
      visible: false
    }));
  };

  return {
    alerta,
    mostrarExito,
    mostrarError,
    ocultarAlerta
  };
};

export default useAlerta; 