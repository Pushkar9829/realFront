import { useEffect, useState } from 'react';
import { Tabs, Spin, Table, message } from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../api/client';

function Kpi({ label, value }) {
  return (
    <div className="kpi-card">
      <div className="label">{label}</div>
      <div className="value">{typeof value === 'number' ? value.toLocaleString('en-IN') : value}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [main, setMain] = useState(null);
  const [sales, setSales] = useState(null);
  const [collection, setCollection] = useState(null);
  const [broker, setBroker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboards/main'),
      api.get('/dashboards/sales'),
      api.get('/dashboards/collection'),
      api.get('/dashboards/broker'),
    ])
      .then(([m, s, c, b]) => {
        setMain(m.data.data);
        setSales(s.data.data);
        setCollection(c.data.data);
        setBroker(b.data.data);
      })
      .catch((e) => message.error(e.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin />;

  return (
    <div>
      <h1 className="page-title">Management Dashboard</h1>
      <p className="page-sub">Real-time view of inventory, sales, collections and brokers</p>

      <Tabs
        items={[
          {
            key: 'main',
            label: 'Overview',
            children: (
              <div className="kpi-grid">
                <Kpi label="Projects" value={main?.totalProjects} />
                <Kpi label="Total Inventory" value={main?.totalInventory} />
                <Kpi label="Available Plots" value={main?.availablePlots} />
                <Kpi label="Booked Plots" value={main?.bookedPlots} />
                <Kpi label="Sold Plots" value={main?.soldPlots} />
                <Kpi label="Customers" value={main?.totalCustomers} />
                <Kpi label="Leads" value={main?.totalLeads} />
                <Kpi label="Active Brokers" value={main?.activeBrokers} />
                <Kpi label="Bookings" value={main?.totalBookings} />
                <Kpi label="Sales Value (₹)" value={main?.totalSalesValue} />
                <Kpi label="Collected (₹)" value={main?.amountCollected} />
                <Kpi label="Outstanding (₹)" value={main?.amountOutstanding} />
                <Kpi label="Upcoming Installments" value={main?.upcomingInstallments} />
                <Kpi label="Overdue Payments" value={main?.overduePayments} />
              </div>
            ),
          },
          {
            key: 'sales',
            label: 'Sales',
            children: (
              <>
                <div className="kpi-grid">
                  <Kpi label="New Leads" value={sales?.newLeads} />
                  <Kpi label="Converted" value={sales?.convertedLeads} />
                  <Kpi label="Site Visits" value={sales?.siteVisits} />
                  <Kpi label="Bookings" value={sales?.bookings} />
                  <Kpi label="Sales Value (₹)" value={sales?.salesValue} />
                </div>
                <h3>Project-wise sales</h3>
                <div style={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sales?.projectWise || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#1a5c45" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            ),
          },
          {
            key: 'collection',
            label: 'Collections',
            children: (
              <>
                <div className="kpi-grid">
                  <Kpi label="Expected (₹)" value={collection?.totalExpectedCollection} />
                  <Kpi label="Collected (₹)" value={collection?.totalCollected} />
                  <Kpi label="Pending (₹)" value={collection?.pendingCollection} />
                  <Kpi label="Overdue (₹)" value={collection?.overdueCollection} />
                </div>
                <Table
                  rowKey={(r) => r._id || r.name}
                  dataSource={collection?.customerWiseOutstanding || []}
                  columns={[
                    { title: 'Customer', dataIndex: 'name' },
                    { title: 'Outstanding (₹)', dataIndex: 'outstanding' },
                  ]}
                  pagination={false}
                  size="small"
                />
              </>
            ),
          },
          {
            key: 'broker',
            label: 'Brokers',
            children: (
              <div className="kpi-grid">
                <Kpi label="Active Brokers" value={broker?.activeBrokers} />
                <Kpi label="Leads Generated" value={broker?.leadsGenerated} />
                <Kpi label="Site Visits" value={broker?.siteVisits} />
                <Kpi label="Bookings" value={broker?.bookings} />
                <Kpi label="Sales Value (₹)" value={broker?.salesValue} />
                <Kpi label="Commission Generated" value={broker?.commissionGenerated} />
                <Kpi label="Commission Paid" value={broker?.commissionPaid} />
                <Kpi label="Commission Outstanding" value={broker?.commissionOutstanding} />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
