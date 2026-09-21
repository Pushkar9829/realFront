import { useEffect, useState } from 'react';
import { Button, Form, Input, InputNumber, Select, DatePicker, message, Space, Modal, Tag } from 'antd';
import dayjs from 'dayjs';
import CrudPage from '../components/CrudPage';
import api from '../api/client';

export function SiteVisitsPage() {
  const [projects, setProjects] = useState([]);
  useEffect(() => {
    api.get('/projects', { params: { limit: 100 } }).then((r) => setProjects(r.data.data.items || []));
  }, []);

  return (
    <CrudPage
      title="Site Visits"
      subtitle="Schedule and track property visits"
      endpoint="/site-visits"
      columns={[
        { title: 'Project', dataIndex: ['project', 'name'] },
        { title: 'Customer', dataIndex: ['customer', 'name'] },
        { title: 'Date', dataIndex: 'visitDate', render: (v) => (v ? dayjs(v).format('DD MMM YYYY') : '-') },
        { title: 'Time', dataIndex: 'visitTime' },
        { title: 'Status', dataIndex: 'status' },
      ]}
      formFields={[
        {
          name: 'project',
          label: 'Project',
          rules: [{ required: true }],
          input: <Select options={projects.map((p) => ({ value: p._id, label: p.name }))} />,
        },
        {
          name: 'visitDate',
          label: 'Visit Date',
          rules: [{ required: true }],
          input: <DatePicker style={{ width: '100%' }} />,
        },
        { name: 'visitTime', label: 'Visit Time' },
        {
          name: 'status',
          label: 'Status',
          initialValue: 'Scheduled',
          input: (
            <Select
              options={['Scheduled', 'Completed', 'Rescheduled', 'Cancelled', 'No Show'].map((v) => ({
                value: v,
                label: v,
              }))}
            />
          ),
        },
        { name: 'remarks', label: 'Remarks', input: <Input.TextArea rows={2} /> },
      ]}
      mapRecord={(v) => ({
        ...v,
        visitDate: v.visitDate ? dayjs(v.visitDate).toISOString() : undefined,
        project: typeof v.project === 'object' ? v.project?._id : v.project,
      })}
    />
  );
}

export function FollowUpsPage() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    api.get('/users', { params: { limit: 100 } }).then((r) => setUsers(r.data.data.items || [])).catch(() => {});
  }, []);

  return (
    <CrudPage
      title="Follow-ups"
      subtitle="Pending actions and reminders"
      endpoint="/follow-ups"
      columns={[
        { title: 'Date', dataIndex: 'followUpDate', render: (v) => (v ? dayjs(v).format('DD MMM YYYY') : '-') },
        { title: 'Type', dataIndex: 'type' },
        { title: 'Status', dataIndex: 'status' },
        { title: 'Owner', dataIndex: ['responsibleEmployee', 'name'] },
        { title: 'Next Action', dataIndex: 'nextAction' },
      ]}
      formFields={[
        {
          name: 'followUpDate',
          label: 'Follow-up Date',
          rules: [{ required: true }],
          input: <DatePicker style={{ width: '100%' }} />,
        },
        { name: 'followUpTime', label: 'Time' },
        { name: 'type', label: 'Type', initialValue: 'Call' },
        {
          name: 'responsibleEmployee',
          label: 'Responsible',
          rules: [{ required: true }],
          input: <Select options={users.map((u) => ({ value: u._id, label: u.name }))} />,
        },
        {
          name: 'status',
          label: 'Status',
          initialValue: 'Pending',
          input: <Select options={['Pending', 'Completed', 'Missed'].map((v) => ({ value: v, label: v }))} />,
        },
        { name: 'nextAction', label: 'Next Action' },
        { name: 'remarks', label: 'Remarks', input: <Input.TextArea rows={2} /> },
      ]}
      mapRecord={(v) => ({
        ...v,
        followUpDate: v.followUpDate ? dayjs(v.followUpDate).toISOString() : undefined,
        responsibleEmployee:
          typeof v.responsibleEmployee === 'object' ? v.responsibleEmployee?._id : v.responsibleEmployee,
      })}
    />
  );
}

export function PaymentSchemesPage() {
  return (
    <CrudPage
      title="Payment Schemes"
      subtitle="Outright and EMI templates (Real Life City style)"
      endpoint="/payment-schemes"
      columns={[
        { title: 'Name', dataIndex: 'name' },
        { title: 'Code', dataIndex: 'code' },
        { title: 'Type', dataIndex: 'type' },
        { title: 'Installments', dataIndex: 'numberOfInstallments' },
        { title: 'App Amount', dataIndex: 'applicationAmount' },
      ]}
      formFields={[
        { name: 'name', label: 'Name', rules: [{ required: true }] },
        { name: 'code', label: 'Code', rules: [{ required: true }] },
        {
          name: 'type',
          label: 'Type',
          rules: [{ required: true }],
          input: <Select options={[{ value: 'outright', label: 'Outright' }, { value: 'emi', label: 'EMI' }]} />,
        },
        { name: 'applicationAmount', label: 'Application Amount', input: <InputNumber style={{ width: '100%' }} /> },
        { name: 'enrolmentAmount', label: 'Enrolment Amount', input: <InputNumber style={{ width: '100%' }} /> },
        { name: 'numberOfInstallments', label: 'Number of Installments', input: <InputNumber style={{ width: '100%' }} /> },
        { name: 'installmentAmount', label: 'Installment Amount', input: <InputNumber style={{ width: '100%' }} /> },
        { name: 'description', label: 'Description', input: <Input.TextArea rows={2} /> },
      ]}
    />
  );
}

export function BookingsPage() {
  const [customers, setCustomers] = useState([]);
  const [plots, setPlots] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    Promise.all([
      api.get('/customers', { params: { limit: 200 } }),
      api.get('/plots', { params: { limit: 200, status: 'Available' } }),
      api.get('/brokers', { params: { limit: 200 } }),
      api.get('/payment-schemes', { params: { limit: 50 } }),
    ]).then(([c, p, b, s]) => {
      setCustomers(c.data.data.items || []);
      setPlots(p.data.data.items || []);
      setBrokers(b.data.data.items || []);
      setSchemes(s.data.data.items || []);
    });
  }, [reloadKey]);

  return (
    <div>
      <div className="toolbar">
        <div>
          <h1 className="page-title">Bookings</h1>
          <p className="page-sub">Create bookings against available plots</p>
        </div>
        <Button type="primary" style={{ background: 'var(--brand)' }} onClick={() => setOpen(true)}>
          New Booking
        </Button>
      </div>
      <CrudPage
        key={reloadKey}
        title=""
        endpoint="/bookings"
        columns={[
          { title: 'Code', dataIndex: 'bookingCode' },
          { title: 'Customer', dataIndex: ['customer', 'name'] },
          { title: 'Project', dataIndex: ['project', 'name'] },
          { title: 'Plot', dataIndex: ['plot', 'plotNumber'] },
          { title: 'Value', dataIndex: 'plotValue' },
          { title: 'Paid', dataIndex: 'paidAmount' },
          { title: 'Balance', dataIndex: 'balanceAmount' },
          { title: 'Status', dataIndex: 'status', render: (s) => <Tag>{s}</Tag> },
        ]}
        formFields={[]}
      />
      <Modal
        title="Create Booking"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={async () => {
          const v = await form.validateFields();
          try {
            await api.post('/bookings', v);
            message.success('Booking created');
            setOpen(false);
            form.resetFields();
            setReloadKey((k) => k + 1);
          } catch (e) {
            message.error(e.response?.data?.message || 'Failed');
          }
        }}
        width={640}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="customer" label="Customer" rules={[{ required: true }]}>
            <Select options={customers.map((c) => ({ value: c._id, label: `${c.name} (${c.mobile})` }))} showSearch optionFilterProp="label" />
          </Form.Item>
          <Form.Item name="plot" label="Plot" rules={[{ required: true }]}>
            <Select
              options={plots.map((p) => ({
                value: p._id,
                label: `${p.plotNumber} — ₹${p.totalValue} (${p.status})`,
              }))}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item name="broker" label="Broker">
            <Select allowClear options={brokers.map((b) => ({ value: b._id, label: b.name }))} />
          </Form.Item>
          <Form.Item name="paymentScheme" label="Payment Scheme">
            <Select allowClear options={schemes.map((s) => ({ value: s._id, label: s.name }))} />
          </Form.Item>
          <Form.Item name="bookingAmount" label="Booking Amount" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="discount" label="Discount" initialValue={0}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="remarks" label="Remarks">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export function PaymentsPage() {
  const [bookings, setBookings] = useState([]);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [key, setKey] = useState(0);

  useEffect(() => {
    api.get('/bookings', { params: { limit: 200 } }).then((r) => setBookings(r.data.data.items || []));
  }, [key]);

  return (
    <div>
      <div className="toolbar">
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="page-sub">Collections and receipts</p>
        </div>
        <Button type="primary" style={{ background: 'var(--brand)' }} onClick={() => setOpen(true)}>
          Record Payment
        </Button>
      </div>
      <CrudPage
        key={key}
        title=""
        endpoint="/payments"
        columns={[
          { title: 'Receipt', dataIndex: 'receiptNumber' },
          { title: 'Customer', dataIndex: ['customer', 'name'] },
          { title: 'Booking', dataIndex: ['booking', 'bookingCode'] },
          { title: 'Amount', dataIndex: 'amount' },
          { title: 'Mode', dataIndex: 'paymentMode' },
          { title: 'Date', dataIndex: 'paymentDate', render: (v) => (v ? dayjs(v).format('DD MMM YYYY') : '-') },
          {
            title: 'Receipt',
            render: (_, r) => (
              <Button
                size="small"
                onClick={async () => {
                  const res = await api.get(`/payments/${r._id}/receipt`);
                  Modal.info({
                    title: 'Payment Receipt',
                    width: 520,
                    content: (
                      <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(res.data.data, null, 2)}</pre>
                    ),
                  });
                }}
              >
                View
              </Button>
            ),
          },
        ]}
        formFields={[]}
      />
      <Modal
        title="Record Payment"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={async () => {
          const v = await form.validateFields();
          try {
            await api.post('/payments', v);
            message.success('Payment recorded');
            setOpen(false);
            form.resetFields();
            setKey((k) => k + 1);
          } catch (e) {
            message.error(e.response?.data?.message || 'Failed');
          }
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="booking" label="Booking" rules={[{ required: true }]}>
            <Select
              options={bookings.map((b) => ({
                value: b._id,
                label: `${b.bookingCode} — ${b.customer?.name || ''} (bal ₹${b.balanceAmount})`,
              }))}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="paymentMode" label="Mode" initialValue="UPI">
            <Select
              options={['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Online payment', 'Other'].map((v) => ({
                value: v,
                label: v,
              }))}
            />
          </Form.Item>
          <Form.Item name="transactionRef" label="Transaction / Reference">
            <Input />
          </Form.Item>
          <Form.Item name="remarks" label="Remarks">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export function InstallmentsPage() {
  return (
    <CrudPage
      title="Installments"
      subtitle="EMI schedules — overdue highlighted on dashboard"
      endpoint="/installments"
      columns={[
        { title: '#', dataIndex: 'installmentNumber', width: 60 },
        { title: 'Booking', dataIndex: ['booking', 'bookingCode'] },
        { title: 'Customer', dataIndex: ['customer', 'name'] },
        { title: 'Due', dataIndex: 'dueDate', render: (v) => (v ? dayjs(v).format('DD MMM YYYY') : '-') },
        { title: 'Amount', dataIndex: 'amount' },
        { title: 'Paid', dataIndex: 'paidAmount' },
        {
          title: 'Status',
          dataIndex: 'status',
          render: (s) => <Tag color={s === 'Overdue' ? 'red' : s === 'Paid' ? 'green' : 'blue'}>{s}</Tag>,
        },
      ]}
      formFields={[]}
    />
  );
}

export function CommissionsPage() {
  return (
    <CrudPage
      title="Commissions"
      subtitle="Broker settlement tracking"
      endpoint="/commissions"
      columns={[
        { title: 'Broker', dataIndex: ['broker', 'name'] },
        { title: 'Booking', dataIndex: ['booking', 'bookingCode'] },
        { title: 'Eligible', dataIndex: 'eligibleAmount' },
        { title: 'Paid', dataIndex: 'paidAmount' },
        { title: 'Pending', dataIndex: 'pendingAmount' },
        { title: 'Status', dataIndex: 'status' },
      ]}
      formFields={[]}
      extraActions={(record, reload) =>
        record.pendingAmount > 0 ? (
          <Button
            size="small"
            onClick={async () => {
              await api.post(`/commissions/${record._id}/pay`, {});
              message.success('Marked paid');
              reload();
            }}
          >
            Pay
          </Button>
        ) : null
      }
    />
  );
}
