// Definición centralizada de colores y variables de tema para la aplicación
// Este archivo actúa como una fuente única de verdad para el sistema de diseño

// Colores principales
export const colors = {
  // Colores de marca
  primary: '#72c260',
  primaryLight: '#8fd67e',
  primaryDark: '#5b9c4d',
  
  // Colores semánticos
  success: '#72c260',
  info: '#1890ff',
  warning: '#faad14',
  error: '#ff4d4f',
  
  // Colores neutrales
  text: '#000000d9',
  textSecondary: '#00000073',
  background: '#ffffff',
  backgroundSecondary: '#f5f5f5',
  border: '#d9d9d9',
};

// Bordes y sombras
export const borders = {
  radius: 6,
  radiusLarge: 12,
  shadowSmall: '0 2px 8px rgba(0, 0, 0, 0.15)',
  shadowMedium: '0 4px 12px rgba(0, 0, 0, 0.15)',
  shadowLarge: '0 8px 24px rgba(0, 0, 0, 0.15)',
};

// Espaciado
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Tipografía
export const typography = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  fontSize: {
    small: 12,
    base: 14,
    large: 16,
    xlarge: 20,
    xxlarge: 24,
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    base: 1.5,
    loose: 1.75,
  },
};

// Temas para Ant Design
export const antThemeTokens = {
  light: {
    colorPrimary: colors.primary,
    colorSuccess: colors.success,
    colorInfo: colors.info,
    colorWarning: colors.warning,
    colorError: colors.error,
    colorText: colors.text,
    colorTextSecondary: colors.textSecondary,
    colorBgContainer: colors.background,
    colorBgElevated: colors.background,
    colorBgLayout: colors.backgroundSecondary,
    colorBorder: colors.border,
    borderRadius: borders.radius,
    wireframe: false,
  },
  dark: {
    colorPrimary: colors.primary,
    colorSuccess: colors.success,
    colorInfo: colors.info,
    colorWarning: colors.warning,
    colorError: colors.error,
    // Versiones oscuras de los colores
    colorText: '#ffffffd9',
    colorTextSecondary: '#ffffff73',
    colorBgContainer: '#141414',
    colorBgElevated: '#1f1f1f',
    colorBgLayout: '#000000',
    colorBorder: '#434343',
    borderRadius: borders.radius,
    wireframe: false,
  },
};

// Configuración de componentes específicos
export const componentOverrides = {
  Button: {
    colorPrimary: colors.primary,
    algorithm: true,
  },
  Menu: {
    colorPrimary: colors.primary,
    itemHoverColor: colors.primaryLight,
  },
  Checkbox: {
    colorPrimary: colors.primary,
  },
  Radio: {
    colorPrimary: colors.primary,
  },
  Switch: {
    colorPrimary: colors.primary,
  },
};

export default {
  colors,
  borders,
  spacing,
  typography,
  antThemeTokens,
  componentOverrides,
}; 