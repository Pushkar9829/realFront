import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, message, Popconfirm, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../api/client';

/**
 * Generic list + create/edit modal page for CRUD modules.
 */
export default function CrudPage({
  title,
  subtitle,
  endpoint,
  columns,
  formFields,
  mapRecord,
  extraActions,
}) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const load = async (p = page, s = search) => {
    setLoading(true);
    try {
      const res = await api.get(endpoint, { params: { page: p, limit: 20, search: s || undefined } });
      setData(res.data.data.items || []);
      setTotal(res.data.data.total || 0);
    } catch (e) {
      message.error(e.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1, search);
    setPage(1);
  }, [endpoint]);

  const onSubmit = async () => {
    const values = await form.validateFields();
    const payload = mapRecord ? mapRecord(values) : values;
    try {
      if (editing) {
        await api.put(`${endpoint}/${editing._id}`, payload);
        message.success('Updated');
      } else {
        await api.post(endpoint, payload);
        message.success('Created');
      }
      setOpen(false);
      setEditing(null);
      form.resetFields();
      load();
    } catch (e) {
      message.error(e.response?.data?.message || e.response?.data?.details?.join?.(', ') || 'Save failed');
    }
  };

  const onEdit = (record) => {
    setEditing(record);
    form.setFieldsValue(record);
    setOpen(true);
  };

  const onDelete = async (record) => {
    try {
      await api.delete(`${endpoint}/${record._id}`);
      message.success('Removed');
      load();
    } catch (e) {
      message.error(e.response?.data?.message || 'Delete failed');
    }
  };

  const cols = [
    ...columns,
    ...(formFields?.length || extraActions
      ? [
          {
            title: 'Actions',
            key: 'actions',
            width: 180,
            render: (_, record) => (
              <Space>
                {extraActions?.(record, load)}
                {formFields?.length > 0 && (
                  <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(record)} />
                )}
                {formFields?.length > 0 && (
                  <Popconfirm title="Remove?" onConfirm={() => onDelete(record)}>
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                )}
              </Space>
            ),
          },
        ]
      : []),
  ];

  return (
    <div>
      {(title || formFields?.length > 0) && (
        <div className="toolbar">
          <div>
            {title ? <h1 className="page-title">{title}</h1> : null}
            {subtitle && <p className="page-sub">{subtitle}</p>}
          </div>
          <Space>
            <Input.Search
              placeholder="Search"
              allowClear
              onSearch={(v) => {
                setSearch(v);
                setPage(1);
                load(1, v);
              }}
              style={{ width: 220 }}
            />
            {formFields?.length > 0 && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                style={{ background: 'var(--brand)' }}
                onClick={() => {
                  setEditing(null);
                  form.resetFields();
                  setOpen(true);
                }}
              >
                Add
              </Button>
            )}
          </Space>
        </div>
      )}

      <Table
        rowKey="_id"
        loading={loading}
        columns={cols}
        dataSource={data}
        pagination={{
          current: page,
          total,
          pageSize: 20,
          onChange: (p) => {
            setPage(p);
            load(p, search);
          },
        }}
      />

      <Modal
        title={editing ? `Edit ${title}` : `Add ${title}`}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
        width={640}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          {formFields.map((f) => (
            <Form.Item key={f.name} name={f.name} label={f.label} rules={f.rules} initialValue={f.initialValue}>
              {f.input || <Input />}
            </Form.Item>
          ))}
        </Form>
      </Modal>
    </div>
  );
}

export { Select, Form, Input };
