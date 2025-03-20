import { Layout, Button, Typography, Dropdown, Space, Avatar, Switch } from 'antd';
import { signOut, useSession } from 'next-auth/react';
import { UserOutlined, DownOutlined, BulbOutlined, BulbFilled } from '@ant-design/icons';
import { useTheme } from '@/context/ThemeContext';

const { Header } = Layout;
const { Title, Text } = Typography;

interface NavBarProps {
  title?: string;
}

export const NavBar = ({ title = 'Home' }: NavBarProps) => {
  const { data: session } = useSession();
  const { themeMode, toggleTheme } = useTheme();

  const menuItems = {
    items: [
      {
        key: '1',
        label: (
          <div style={{ padding: '16px', minWidth: '250px' }}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Avatar size={64} icon={<UserOutlined />} src={session?.user?.image} />
                <div>
                  <Text strong style={{ fontSize: '16px' }}>{session?.user?.name}</Text>
                  <br />
                  <Text type="secondary">{session?.user?.email}</Text>
                </div>
              </div>
              
              {session?.expires && (
                <div>
                  <Text type="secondary">Sesión expira: {new Date(session.expires).toLocaleDateString()}</Text>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>  
                <Text type="secondary">Tema</Text>
                <Switch
                  checkedChildren={<BulbFilled />}
                  unCheckedChildren={<BulbOutlined />}
                  checked={themeMode === 'dark'}
                  onChange={toggleTheme}
                />
              </div>
              
              <Button 
                type="primary" 
                danger
                block
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                Cerrar Sesión
              </Button>
            </Space>
          </div>
        ),
      },
    ],
  };

  return (
    <Header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 24px',
        backgroundColor: 'transparent',
        color: themeMode === 'dark' ? 'white' : 'black',
      }}
    >
      <Title
        level={3}
        style={{
          color: themeMode === 'dark' ? 'white' : 'black',
          margin: 0,
        }}
      >
        {title}
      </Title>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {session?.user?.name && (
          <Dropdown menu={menuItems} trigger={['click']} placement="bottomRight">
            <a
              onClick={(e) => e.preventDefault()}
              style={{ color: themeMode === 'dark' ? 'white' : 'black' }}
            >
              <Space>
                <Avatar size="small" icon={<UserOutlined />} src={session?.user?.image} />
                {session.user.name}
                <DownOutlined />
              </Space>
            </a>
          </Dropdown>
        )}
      </div>
    </Header>
  );
}; 