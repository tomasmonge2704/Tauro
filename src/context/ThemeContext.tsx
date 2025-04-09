'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ConfigProvider, theme } from 'antd';
import { antThemeTokens, componentOverrides } from '@/styles/theme';

// Ahora solo usamos el modo oscuro
type ThemeMode = 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  // Eliminamos la función de cambio de tema
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Siempre será 'dark'
  const [themeMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    // Siempre establecemos el tema oscuro
    localStorage.setItem('theme', 'dark');
  }, []);

  // Configuración del tema de Ant Design siempre en modo oscuro
  const themeConfig = {
    algorithm: theme.darkAlgorithm,
    token: antThemeTokens['dark'],
    components: componentOverrides,
  };

  return (
    <ThemeContext.Provider value={{ themeMode }}>
      <ConfigProvider theme={themeConfig}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
}; 