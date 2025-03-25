'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Layout, Breadcrumb } from 'antd';
import { NavBar } from '@/components/NavBar';
import { useTheme } from '@/context/ThemeContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const { Content } = Layout;

interface NavBarWrapperProps {
  children: ReactNode;
}

export function NavBarWrapper({ children }: NavBarWrapperProps) {
  const { themeMode } = useTheme();
  const pathname = usePathname();
  const pageTitle = 'Tauro';
  const [isDesktop, setIsDesktop] = useState(true);
  
  // Detectar si es vista desktop
  useEffect(() => {
    const checkIfDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    checkIfDesktop();
    window.addEventListener('resize', checkIfDesktop);
    
    return () => {
      window.removeEventListener('resize', checkIfDesktop);
    };
  }, []);
  
  // No mostrar NavBar en la página de login
  const isLoginPage = pathname === '/login';
  
  // Generar breadcrumb items
  const generateBreadcrumbItems = () => {
    const paths = pathname.split('/').filter(Boolean);
    const items = [{ title: <Link href="/">Inicio</Link>, key: 'home' }];
    
    let currentPath = '';
    
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      
      let title = path.charAt(0).toUpperCase() + path.slice(1);
      
      // Personalizar títulos específicos
      if (path === 'users' && index === 0) title = 'Usuarios';
      if (path === 'admin') title = 'Administración';
      if (path === 'dashboard') title = 'Dashboard';
      if (path === 'edit') title = 'Editar';
      
      items.push({
        title: index === paths.length - 1 
          ? <span>{title}</span> 
          : <Link href={currentPath}>{title}</Link>,
        key: currentPath
      });
    });
    
    return items;
  };
  
  return (
    <Layout style={{ 
      minHeight: '100vh', 
      backgroundColor: themeMode === 'dark' ? '#141414' : '#f0f0f0',
      overflowX: 'auto' // Permitir scroll horizontal en todo el layout
    }}>
      {!isLoginPage && <NavBar title={pageTitle} />}
      <Content style={{ 
        padding: isLoginPage ? 0 : '24px',
        minWidth: isDesktop ? 'auto' : '768px' // Ancho mínimo para móviles
      }}>
        {!isLoginPage && isDesktop && (
          <Breadcrumb 
            items={generateBreadcrumbItems()}
            style={{ 
              marginBottom: '16px',
              width: '100%',
              alignSelf: 'center'
            }} 
          />
        )}
        {children}
      </Content>
    </Layout>
  );
} 