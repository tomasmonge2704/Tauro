import { useState } from 'react';

interface VerificacionQR {
  valid: boolean;
  user?: {
    nombre: string;
    id: string;
  };
  error?: string;
}

interface UseQRValidationReturn {
  verificando: boolean;
  resultado: VerificacionQR | null;
  validarQR: (qrToken: string) => Promise<void>;
  resetResultado: () => void;
}

export const useQRValidation = (): UseQRValidationReturn => {
  const [verificando, setVerificando] = useState(false);
  const [resultado, setResultado] = useState<VerificacionQR | null>(null);

  const validarQR = async (qrToken: string) => {
    try {
      setVerificando(true);
      console.log('Validando QR Token:', qrToken);
      
      const response = await fetch('/api/validar-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qrToken }),
      });
      
      const data: VerificacionQR = await response.json();
      setResultado(data);
    } catch (error) {
      console.error('Error al validar QR:', error);
      setResultado({
        valid: false,
        error: 'Error al procesar el código QR'
      });
    } finally {
      setVerificando(false);
    }
  };

  const resetResultado = () => {
    setResultado(null);
  };

  return {
    verificando,
    resultado,
    validarQR,
    resetResultado
  };
}; 