import { Layout, Menu, Dropdown, Badge, Input, Button, theme } from 'antd';
import {
  DashboardOutlined,
  ProjectOutlined,
  AppstoreOutlined,
  TeamOutlined,
  UserOutlined,
  SolutionOutlined,
  CalendarOutlined,
  PhoneOutlined,
  FileDoneOutlined,
  DollarOutlined,
  PercentageOutlined,
  FolderOutlined,
  BarChartOutlined,
  SettingOutlined,
  BellOutlined,
  LogoutOutlined,
  SearchOutlined,
  ClusterOutlined,
  PartitionOutlined,
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import api from '../api/client';

const { Header, Sider, Content } = Layout;

const items = [
  { key: '/', icon: <DashboardOutlined />, label: 'Dashboard', perm: 'dashboards.view' },
  { key: '/projects', icon: <ProjectOutlined />, label: 'Projects', perm: 'projects.manage' },
  { key: '/plots', icon: <AppstoreOutlined />, label: 'Plot Inventory', perm: 'plots.manage' },
  { key: '/plot-map', icon: <PartitionOutlined />, label: 'Plot Map', perm: 'plotMaps.manage' },
  { key: '/brokers', icon: <TeamOutlined />, label: 'Brokers', perm: 'brokers.manage' },
  { key: '/customers', icon: <UserOutlined />, label: 'Customers', perm: 'customers.manage' },
  { key: '/leads', icon: <SolutionOutlined />, label: 'Leads', perm: 'leads.manage' },
  { key: '/site-visits', icon: <CalendarOutlined />, label: 'Site Visits', perm: 'siteVisits.manage' },
  { key: '/follow-ups', icon: <PhoneOutlined />, label: 'Follow-ups', perm: 'followUps.manage' },
  { key: '/bookings', icon: <FileDoneOutlined />, label: 'Bookings', perm: 'bookings.manage' },
  { key: '/payment-schemes', icon: <DollarOutlined />, label: 'Payment Schemes', perm: 'paymentSchemes.manage' },
  { key: '/payments', icon: <DollarOutlined />, label: 'Payments', perm: 'payments.manage' },
  { key: '/installments', icon: <DollarOutlined />, label: 'Installments', perm: 'installments.manage' },
  { key: '/commissions', icon: <PercentageOutlined />, label: 'Commissions', perm: 'commissions.manage' },
  { key: '/documents', icon: <FolderOutlined />, label: 'Documents', perm: 'documents.manage' },
  { key: '/reports', icon: <BarChartOutlined />, label: 'Reports', perm: 'reports.view' },
  { key: '/users', icon: <TeamOutlined />, label: 'Users', perm: 'users.manage' },
  { key: '/designations', icon: <ClusterOutlined />, label: 'Designations', perm: 'designations.manage' },
  { key: '/settings', icon: <SettingOutlined />, label: 'Settings', perm: 'settings.manage' },
];

export default function AppLayout() {
  const { user, logout, can } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [unread, setUnread] = useState(0);
  const [q, setQ] = useState('');
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  useEffect(() => {
    if (!can('notifications.manage')) return;
    api
      .get('/notifications', { params: { limit: 1 } })
      .then((res) => setUnread(res.data.data.unread || 0))
      .catch(() => {});
  }, [location.pathname]);

  const menuItems = items
    .filter((i) => can(i.perm))
    .map((i) => ({
      key: i.key,
      icon: i.icon,
      label: <Link to={i.key}>{i.label}</Link>,
    }));

  const onSearch = () => {
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const siderWidth = collapsed ? 80 : 240;

  return (
    <Layout className="app-shell">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={240}
        className="app-sider"
        style={{
          background: 'var(--brand-deep)',
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        <div style={{ padding: collapsed ? '1rem 0.5rem' : '1.25rem 1rem', color: '#fff' }}>
          <div className="brand-mark" style={{ fontSize: collapsed ? 14 : 18, lineHeight: 1.2 }}>
            {collapsed ? 'LRE' : 'Lalita Real Estate'}
          </div>
          {!collapsed && (
            <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>ERP + CRM</div>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname === '/' ? '/' : `/${location.pathname.split('/')[1]}`]}
          items={menuItems}
          style={{ background: 'transparent', borderInlineEnd: 0 }}
        />
      </Sider>
      <Layout
        className="app-main"
        style={{
          marginLeft: siderWidth,
          minHeight: '100vh',
          transition: 'margin-left 0.2s',
        }}
      >
        <Header
          className="app-header"
          style={{
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            paddingInline: 20,
            borderBottom: '1px solid #d5e5dc',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            width: '100%',
          }}
        >
          <Input.Search
            placeholder="Search customer, plot, booking, receipt..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onSearch={onSearch}
            style={{ maxWidth: 420 }}
            enterButton={<SearchOutlined />}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Badge count={unread} size="small">
              <Button type="text" icon={<BellOutlined />} onClick={() => navigate('/notifications')} />
            </Badge>
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'out',
                    icon: <LogoutOutlined />,
                    label: 'Logout',
                    onClick: () => {
                      logout();
                      navigate('/login');
                    },
                  },
                ],
              }}
            >
              <Button type="text">{user?.name || 'User'}</Button>
            </Dropdown>
          </div>
        </Header>
        <Content className="app-content">
          <div className="app-content-inner">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
