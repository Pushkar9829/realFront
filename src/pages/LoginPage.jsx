import { useState } from 'react';
import { Form, Input, Button, message, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const DEMO_ACCOUNTS = [
  {
    panel: 'Super Admin',
    email: 'admin@lalitarealestateinfra.com',
    password: 'Admin@123',
    note: 'Full system access',
  },
  {
    panel: 'Management',
    email: 'manager@lalitarealestateinfra.com',
    password: 'Manager@123',
    note: 'Dashboards & business reports',
  },
  {
    panel: 'Sales Team',
    email: 'executive@lalitarealestateinfra.com',
    password: 'Sales@123',
    note: 'Leads, visits, bookings',
  },
  {
    panel: 'Broker / Associate',
    email: 'broker.login@lalitarealestateinfra.com',
    password: 'Broker@123',
    note: 'Broker portal access',
  },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  async function onFinish(values) {
    setLoading(true);
    try {
      await login(values.email, values.password);
      message.success('Welcome back');
      navigate('/');
    } catch (err) {
      message.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  function fillAccount(account) {
    form.setFieldsValue({ email: account.email, password: account.password });
  }

  return (
    <div className="login-shell">
      <div className="login-card" style={{ width: 'min(520px, 100%)' }}>
        <h1 className="brand-mark">Lalita Real Estate Infra</h1>
        <p>Sign in to the Real Estate ERP + CRM</p>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            email: DEMO_ACCOUNTS[0].email,
            password: DEMO_ACCOUNTS[0].password,
          }}
        >
          <Form.Item name="email" label="Email / ID" rules={[{ required: true, type: 'email' }]}>
            <Input size="large" autoComplete="username" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password size="large" autoComplete="current-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large" loading={loading} style={{ background: 'var(--brand)' }}>
            Sign in
          </Button>
        </Form>

        <div className="demo-accounts" style={{ marginTop: 24 }}>
          <Typography.Text strong style={{ color: 'var(--brand-deep)' }}>
            Demo panel logins (click to fill)
          </Typography.Text>
          <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                className="demo-account-card"
                onClick={() => fillAccount(account)}
                style={{
                  textAlign: 'left',
                  border: '1px solid #d5e5dc',
                  borderRadius: 10,
                  padding: '10px 12px',
                  background: '#f7faf8',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--brand-deep)' }}>{account.panel}</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>
                  <strong>ID:</strong> {account.email}
                </div>
                <div style={{ fontSize: 13 }}>
                  <strong>Password:</strong> {account.password}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{account.note}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
