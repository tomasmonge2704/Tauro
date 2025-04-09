import { isMobile } from 'react-device-detect';
import { Breadcrumb } from 'antd';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadCumItem {
  title: React.ReactNode;
  key: string;
}

export const BreadCum = () => {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  // Generar breadcrumb items
  const generateBreadcrumbItems = () => {
    const paths = pathname.split('/').filter(Boolean);
    const items: BreadCumItem[] = [];
    
    let currentPath = '';
    
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      
      let title = path.charAt(0).toUpperCase() + path.slice(1);
      
      // Personalizar títulos específicos
      if (path === 'users' && index === 0) title = 'Usuarios';
      if (path === 'admin') title = 'Administración';
      if (path === 'dashboard') title = 'Dashboard';
      if (path === 'edit') title = 'Editar';
      
      // Limitar el título a máximo 10 caracteres
      if (title.length > 10) {
        title = title.substring(0, 7) + '...';
      }
      
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
    !isLoginPage && !isMobile && pathname !== '/' ? (
        <Breadcrumb 
          items={generateBreadcrumbItems()}
        />
      ) : null
  );
};