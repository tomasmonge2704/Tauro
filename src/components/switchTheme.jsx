import { Button } from 'antd';
import { useTheme } from '@/context/ThemeContext';
import { MoonFilled } from '@ant-design/icons';

export const SwitchTheme = () => {
  const { themeMode } = useTheme();
  
  // Estilos fijos para el modo oscuro
  const buttonStyle = {
    width: '100%',
    backgroundColor: '#1f1f1f',
    color: '#ffffff',
    border: '1px solid #434343',
    boxShadow: 'none',
    display: 'flex',
    alignItems: 'center'
  };
  
  return (
    <Button
      style={buttonStyle}
      icon={<MoonFilled />}
      type="primary"
      className="theme-switch-button dark"
      disabled // Deshabilitamos el botón ya que no se puede cambiar el tema
    >
      Modo Oscuro
    </Button>
  );
};
