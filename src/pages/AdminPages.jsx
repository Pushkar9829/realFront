import { useEffect, useState } from 'react';
import { Table, Button, Upload, Form, Input, Select, Modal, message, Space } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import api from '../api/client';
import CrudPage from '../components/CrudPage';
import { useSearchParams } from 'react-router-dom';

export function DocumentsPage() {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [file, setFile] = useState(null);
  const [key, setKey] = useState(0);

  return (
    <div>
      <div className="toolbar">
        <div>
          <h1 className="page-title">Documents</h1>
          <p className="page-sub">KYC, agreements, receipts and supporting files</p>
        </div>
        <Button type="primary" style={{ background: 'var(--brand)' }} onClick={() => setOpen(true)}>
          Upload
        </Button>
      </div>
      <CrudPage
        key={key}
        title=""
        endpoint="/documents"
        columns={[
          { title: 'Title', dataIndex: 'title' },
          { title: 'Category', dataIndex: 'category' },
          { title: 'Customer', dataIndex: ['customer', 'name'] },
          { title: 'Booking', dataIndex: ['booking', 'bookingCode'] },
          { title: 'File', dataIndex: 'originalName' },
        ]}
        formFields={[]}
      />
      <Modal
        title="Upload Document"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={async () => {
          const v = await form.validateFields();
          if (!file) return message.error('Select a file');
          const fd = new FormData();
          Object.entries(v).forEach(([k, val]) => val && fd.append(k, val));
          fd.append('file', file);
          try {
            await api.post('/documents', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            message.success('Uploaded');
            setOpen(false);
            form.resetFields();
            setFile(null);
            setKey((x) => x + 1);
          } catch (e) {
            message.error(e.response?.data?.message || 'Upload failed');
          }
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label="Category" initialValue="Other">
            <Select
              options={['KYC', 'Booking Form', 'Agreement', 'Receipt', 'Property', 'Other'].map((v) => ({
                value: v,
                label: v,
              }))}
            />
          </Form.Item>
          <Form.Item label="File" required>
            <Upload beforeUpload={(f) => { setFile(f); return false; }} maxCount={1}>
              <Button icon={<UploadOutlined />}>Select file</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export function UsersPage() {
  return (
    <CrudPage
      title="Users & Sales Team"
      subtitle="Role-based access for admin, management and sales"
      endpoint="/users"
      columns={[
        { title: 'Name', dataIndex: 'name' },
        { title: 'Email', dataIndex: 'email' },
        { title: 'Mobile', dataIndex: 'mobile' },
        { title: 'Role', dataIndex: 'role' },
        { title: 'Active', dataIndex: 'isActive', render: (v) => (v ? 'Yes' : 'No') },
      ]}
      formFields={[
        { name: 'name', label: 'Name', rules: [{ required: true }] },
        { name: 'email', label: 'Email', rules: [{ required: true, type: 'email' }] },
        { name: 'mobile', label: 'Mobile' },
        { name: 'password', label: 'Password', rules: [{ min: 6 }] },
        {
          name: 'role',
          label: 'Role',
          rules: [{ required: true }],
          input: (
            <Select
              options={[
                { value: 'super_admin', label: 'Super Admin' },
                { value: 'management', label: 'Management' },
                { value: 'sales', label: 'Sales' },
                { value: 'broker', label: 'Broker' },
              ]}
            />
          ),
        },
        { name: 'territory', label: 'Territory' },
      ]}
      mapRecord={(v) => {
        const out = { ...v };
        if (!out.password) delete out.password;
        return out;
      }}
    />
  );
}

export function DesignationsPage() {
  return (
    <CrudPage
      title="Designations & Hierarchy"
      subtitle="Configurable ranks from Associate to Sr. Sales General Manager"
      endpoint="/designations"
      columns={[
        { title: 'Order', dataIndex: 'order', width: 80 },
        { title: 'Name', dataIndex: 'name' },
        { title: 'Description', dataIndex: 'description' },
        { title: 'Active', dataIndex: 'isActive', render: (v) => (v ? 'Yes' : 'No') },
      ]}
      formFields={[
        { name: 'name', label: 'Name', rules: [{ required: true }] },
        { name: 'order', label: 'Rank Order', rules: [{ required: true }], input: <Input type="number" /> },
        { name: 'description', label: 'Description' },
      ]}
    />
  );
}

export function ReportsPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/sales');
      setSales(res.data.data.items || []);
    } catch (e) {
      message.error(e.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div className="toolbar">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-sub">Sales, collections, customers and broker performance</p>
        </div>
        <Space>
          <Button onClick={load}>Refresh Sales</Button>
          <Button
            type="primary"
            style={{ background: 'var(--brand)' }}
            onClick={() => {
              window.open(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/reports/sales?export=excel`,
                '_blank'
              );
            }}
          >
            Export Sales Excel
          </Button>
        </Space>
      </div>
      <Table
        loading={loading}
        rowKey="_id"
        dataSource={sales}
        columns={[
          { title: 'Booking', dataIndex: 'bookingCode' },
          { title: 'Customer', dataIndex: ['customer', 'name'] },
          { title: 'Project', dataIndex: ['project', 'name'] },
          { title: 'Plot', dataIndex: ['plot', 'plotNumber'] },
          { title: 'Broker', dataIndex: ['broker', 'name'] },
          { title: 'Value', dataIndex: 'plotValue' },
          { title: 'Status', dataIndex: 'status' },
        ]}
      />
    </div>
  );
}

export function SettingsPage() {
  const [form] = Form.useForm();
  useEffect(() => {
    api.get('/settings').then((r) => form.setFieldsValue(r.data.data));
  }, []);

  return (
    <div>
      <h1 className="page-title">Settings</h1>
      <p className="page-sub">Company and system configuration</p>
      <Form
        form={form}
        layout="vertical"
        style={{ maxWidth: 480 }}
        onFinish={async (v) => {
          await api.put('/settings', v);
          message.success('Saved');
        }}
      >
        <Form.Item name="companyName" label="Company Name">
          <Input />
        </Form.Item>
        <Button type="primary" htmlType="submit" style={{ background: 'var(--brand)' }}>
          Save
        </Button>
      </Form>
    </div>
  );
}

export function NotificationsPage() {
  const [items, setItems] = useState([]);
  const load = () =>
    api.get('/notifications').then((r) => setItems(r.data.data.items || []));
  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div className="toolbar">
        <h1 className="page-title">Notifications</h1>
        <Button
          onClick={async () => {
            await api.post('/notifications/read-all');
            load();
          }}
        >
          Mark all read
        </Button>
      </div>
      <Table
        rowKey="_id"
        dataSource={items}
        columns={[
          { title: 'Title', dataIndex: 'title' },
          { title: 'Message', dataIndex: 'message' },
          { title: 'Type', dataIndex: 'type' },
          { title: 'Read', dataIndex: 'isRead', render: (v) => (v ? 'Yes' : 'No') },
        ]}
      />
    </div>
  );
}

export function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!q) return;
    api.get('/search', { params: { q } }).then((r) => setData(r.data.data));
  }, [q]);

  if (!data) return <p>Searching…</p>;

  return (
    <div>
      <h1 className="page-title">Search: {q}</h1>
      {Object.entries(data).map(([key, items]) =>
        items?.length ? (
          <div key={key} style={{ marginBottom: 24 }}>
            <h3 style={{ textTransform: 'capitalize' }}>{key}</h3>
            <Table
              rowKey="_id"
              pagination={false}
              size="small"
              dataSource={items}
              columns={[
                { title: 'Name / Code', render: (_, r) => r.name || r.plotNumber || r.bookingCode || r.receiptNumber || r.email },
                { title: 'Mobile', dataIndex: 'mobile' },
                { title: 'Status', dataIndex: 'status' },
              ]}
            />
          </div>
        ) : null
      )}
    </div>
  );
}
