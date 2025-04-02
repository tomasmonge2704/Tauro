'use client';

import React, { useEffect, useState } from 'react';
import { Alert, Space } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { colors } from '@/styles/theme';

export type TipoAlerta = 'exito' | 'error';

interface NotificacionAlertaProps {
  mensaje: string;
  tipo: TipoAlerta;
  visible: boolean;
  onClose?: () => void;
  duracion?: number; // Duración en milisegundos
}

const NotificacionAlerta: React.FC<NotificacionAlertaProps> = ({
  mensaje,
  tipo,
  visible,
  onClose,
  duracion = 3000, // 3 segundos por defecto
}) => {
  const [mostrar, setMostrar] = useState(visible);

  useEffect(() => {
    setMostrar(visible);
    
    if (visible && duracion > 0) {
      const timer = setTimeout(() => {
        setMostrar(false);
        if (onClose) onClose();
      }, duracion);
      
      return () => clearTimeout(timer);
    }
  }, [visible, duracion, onClose]);

  if (!mostrar) return null;

  return (
    <div style={{ 
      position: 'fixed', 
      top: '20px', 
      left: '50%', 
      transform: 'translateX(-50%)', 
      zIndex: 1000,
      width: '90%',
      maxWidth: '500px'
    }}>
      <Alert
        message={
          <Space>
            {tipo === 'exito' ? (
              <CheckCircleOutlined style={{ color: colors.success }} />
            ) : (
              <CloseCircleOutlined style={{ color: colors.error }} />
            )}
            {mensaje}
          </Space>
        }
        type={tipo === 'exito' ? 'success' : 'error'}
        showIcon={false}
        closable
        onClose={() => {
          setMostrar(false);
          if (onClose) onClose();
        }}
        style={{
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          border: `1px solid ${tipo === 'exito' ? colors.success : colors.error}`,
        }}
      />
    </div>
  );
};

export default NotificacionAlerta; 