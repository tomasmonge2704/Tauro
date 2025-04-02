import { Avatar as AntdAvatar, Typography } from 'antd';

const { Text } = Typography;
export const Avatar = ({ nombre }: { nombre: string }) => {
  // Obtener las iniciales del nombre y apellido
  const obtenerIniciales = (nombreCompleto: string) => {
    const partes = nombreCompleto.split(' ');
    
    // Si hay al menos dos partes (nombre y apellido)
    if (partes.length >= 2) {
      // Tomar la primera letra del nombre y la primera letra del apellido
      return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
    }
    
    // Si solo hay una parte, tomar las dos primeras letras
    return nombreCompleto.substring(0, 2).toUpperCase();
  };

  const iniciales = obtenerIniciales(nombre);

  return (
    <AntdAvatar size={120}><Text style={{ fontSize: 50 }}>{iniciales}</Text></AntdAvatar>
  );
};

