import { Button } from 'antd';
import { useTheme } from '@/context/ThemeContext';
import { MoonFilled, SunFilled } from '@ant-design/icons';

export const SwitchTheme = () => {
  const { themeMode, toggleTheme } = useTheme();
  console.log(themeMode);
  // Determinar qué icono mostrar según el tema actual
  const ThemeIcon = themeMode === 'dark' ? MoonFilled : SunFilled;
  
  // Estilos condicionales según el tema
  const buttonStyle = {
    width: '100%',
    backgroundColor: themeMode === 'dark' ? '#1f1f1f' : '#ffffff',
    color: themeMode === 'dark' ? '#ffffff' : '#000000',
    border: themeMode === 'dark' ? '1px solid #434343' : '1px solid #d9d9d9',
    // Asegurar que los estilos se apliquen con más prioridad
    boxShadow: 'none',
    display: 'flex',
    alignItems: 'center'
  };
  
  return (
    <Button
      style={buttonStyle}
      icon={<ThemeIcon />}
      onClick={toggleTheme}
      // Usar el tipo según el tema también puede ayudar
      type={themeMode === 'dark' ? 'primary' : 'default'}
      // Desactivar los estilos predeterminados de hover
      className={`theme-switch-button ${themeMode}`}
    >
      {themeMode === 'dark' ? 'Modo Oscuro' : 'Modo Claro'}
    </Button>
  );
};
