import { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Select } from 'antd';
import CrudPage from '../components/CrudPage';
import api from '../api/client';

export function ProjectsPage() {
  return (
    <CrudPage
      title="Projects"
      subtitle="Manage real-estate projects and content"
      endpoint="/projects"
      columns={[
        { title: 'Name', dataIndex: 'name' },
        { title: 'Code', dataIndex: 'code' },
        { title: 'Location', dataIndex: 'location' },
        { title: 'Status', dataIndex: 'status' },
        { title: 'Plots', dataIndex: 'totalPlots' },
      ]}
      formFields={[
        { name: 'name', label: 'Project Name', rules: [{ required: true }] },
        { name: 'code', label: 'Project Code', rules: [{ required: true }] },
        { name: 'location', label: 'Location' },
        { name: 'address', label: 'Address', input: <Input.TextArea rows={2} /> },
        { name: 'description', label: 'Description', input: <Input.TextArea rows={3} /> },
        { name: 'developer', label: 'Developer', initialValue: 'Lalita Real Estate Infra' },
        {
          name: 'status',
          label: 'Status',
          initialValue: 'Ongoing',
          input: (
            <Select
              options={['Planning', 'Ongoing', 'Completed', 'On Hold'].map((v) => ({ value: v, label: v }))}
            />
          ),
        },
        { name: 'totalArea', label: 'Total Area' },
        { name: 'totalPlots', label: 'Total Plots', input: <InputNumber style={{ width: '100%' }} /> },
        {
          name: 'amenities',
          label: 'Amenities (comma separated)',
          input: <Input placeholder="Club House, School, Swimming Pool" />,
        },
        {
          name: 'connectivity',
          label: 'Connectivity (comma separated)',
          input: <Input />,
        },
        { name: 'pricingInfo', label: 'Pricing Info', input: <Input.TextArea rows={2} /> },
      ]}
      mapRecord={(v) => ({
        ...v,
        amenities: typeof v.amenities === 'string' ? v.amenities.split(',').map((s) => s.trim()).filter(Boolean) : v.amenities,
        connectivity:
          typeof v.connectivity === 'string' ? v.connectivity.split(',').map((s) => s.trim()).filter(Boolean) : v.connectivity,
      })}
    />
  );
}

export function PlotsPage() {
  const [projects, setProjects] = useState([]);
  useEffect(() => {
    api.get('/projects', { params: { limit: 100 } }).then((r) => setProjects(r.data.data.items || []));
  }, []);

  return (
    <CrudPage
      title="Plot Inventory"
      subtitle="Track availability, pricing and booking status"
      endpoint="/plots"
      columns={[
        { title: 'Plot #', dataIndex: 'plotNumber' },
        { title: 'Project', dataIndex: ['project', 'name'] },
        { title: 'Block', dataIndex: 'block' },
        { title: 'Size', dataIndex: 'plotSize' },
        { title: 'Rate', dataIndex: 'rate' },
        { title: 'Value', dataIndex: 'totalValue' },
        { title: 'Status', dataIndex: 'status' },
      ]}
      formFields={[
        {
          name: 'project',
          label: 'Project',
          rules: [{ required: true }],
          input: <Select options={projects.map((p) => ({ value: p._id, label: p.name }))} showSearch optionFilterProp="label" />,
        },
        { name: 'plotNumber', label: 'Plot Number', rules: [{ required: true }] },
        { name: 'block', label: 'Block' },
        { name: 'phase', label: 'Phase' },
        { name: 'plotSize', label: 'Plot Size', rules: [{ required: true }], input: <InputNumber style={{ width: '100%' }} /> },
        { name: 'facing', label: 'Facing' },
        { name: 'rate', label: 'Rate', rules: [{ required: true }], input: <InputNumber style={{ width: '100%' }} /> },
        { name: 'totalValue', label: 'Total Value', rules: [{ required: true }], input: <InputNumber style={{ width: '100%' }} /> },
        {
          name: 'status',
          label: 'Status',
          initialValue: 'Available',
          input: (
            <Select options={['Available', 'Hold', 'Booked', 'Sold', 'Cancelled'].map((v) => ({ value: v, label: v }))} />
          ),
        },
      ]}
      mapRecord={(v) => ({ ...v, project: typeof v.project === 'object' ? v.project._id : v.project })}
    />
  );
}

export function BrokersPage() {
  const [designations, setDesignations] = useState([]);
  useEffect(() => {
    api.get('/designations', { params: { limit: 100 } }).then((r) => setDesignations(r.data.data.items || [])).catch(() => {});
  }, []);

  return (
    <CrudPage
      title="Brokers / Channel Partners"
      subtitle="Hierarchy, territory and commission setup"
      endpoint="/brokers"
      columns={[
        { title: 'Name', dataIndex: 'name' },
        { title: 'Mobile', dataIndex: 'mobile' },
        { title: 'Email', dataIndex: 'email' },
        { title: 'Territory', dataIndex: 'territory' },
        { title: 'Commission', render: (_, r) => `${r.commissionValue}${r.commissionType === 'percentage' ? '%' : ' ₹'}` },
        { title: 'Active', dataIndex: 'isActive', render: (v) => (v ? 'Yes' : 'No') },
      ]}
      formFields={[
        { name: 'name', label: 'Name', rules: [{ required: true }] },
        { name: 'mobile', label: 'Mobile', rules: [{ required: true }] },
        { name: 'email', label: 'Email' },
        { name: 'address', label: 'Address', input: <Input.TextArea rows={2} /> },
        {
          name: 'designation',
          label: 'Designation',
          input: <Select allowClear options={designations.map((d) => ({ value: d._id, label: d.name }))} />,
        },
        { name: 'territory', label: 'Territory' },
        {
          name: 'commissionType',
          label: 'Commission Type',
          initialValue: 'percentage',
          input: <Select options={[{ value: 'percentage', label: 'Percentage' }, { value: 'fixed', label: 'Fixed' }]} />,
        },
        { name: 'commissionValue', label: 'Commission Value', initialValue: 2, input: <InputNumber style={{ width: '100%' }} /> },
      ]}
    />
  );
}

export function CustomersPage() {
  return (
    <CrudPage
      title="Customers"
      subtitle="Centralized client database"
      endpoint="/customers"
      columns={[
        { title: 'Name', dataIndex: 'name' },
        { title: 'Mobile', dataIndex: 'mobile' },
        { title: 'Email', dataIndex: 'email' },
        { title: 'City', dataIndex: 'city' },
        { title: 'Source', dataIndex: 'leadSource' },
        { title: 'Budget', dataIndex: 'budget' },
      ]}
      formFields={[
        { name: 'name', label: 'Name', rules: [{ required: true }] },
        { name: 'mobile', label: 'Mobile', rules: [{ required: true }] },
        { name: 'alternateNumber', label: 'Alternate Number' },
        { name: 'email', label: 'Email' },
        { name: 'address', label: 'Address', input: <Input.TextArea rows={2} /> },
        { name: 'city', label: 'City' },
        { name: 'state', label: 'State' },
        { name: 'pan', label: 'PAN' },
        { name: 'budget', label: 'Budget', input: <InputNumber style={{ width: '100%' }} /> },
        { name: 'notes', label: 'Notes', input: <Input.TextArea rows={2} /> },
      ]}
    />
  );
}

export function LeadsPage() {
  const [projects, setProjects] = useState([]);
  useEffect(() => {
    api.get('/projects', { params: { limit: 100 } }).then((r) => setProjects(r.data.data.items || []));
  }, []);

  return (
    <CrudPage
      title="Leads"
      subtitle="Capture, assign and convert enquiries"
      endpoint="/leads"
      columns={[
        { title: 'Name', dataIndex: 'name' },
        { title: 'Mobile', dataIndex: 'mobile' },
        { title: 'Source', dataIndex: 'source' },
        { title: 'Status', dataIndex: 'status' },
        { title: 'Project', dataIndex: ['interestedProject', 'name'] },
        { title: 'Budget', dataIndex: 'budget' },
      ]}
      formFields={[
        { name: 'name', label: 'Name', rules: [{ required: true }] },
        { name: 'mobile', label: 'Mobile', rules: [{ required: true }] },
        { name: 'email', label: 'Email' },
        {
          name: 'source',
          label: 'Source',
          initialValue: 'Direct enquiry',
          input: (
            <Select
              options={[
                'Website',
                'Direct enquiry',
                'Broker',
                'Referral',
                'Advertisement',
                'Social media',
                'Walk-in',
                'Campaign',
                'Other',
              ].map((v) => ({ value: v, label: v }))}
            />
          ),
        },
        {
          name: 'status',
          label: 'Status',
          initialValue: 'New',
          input: (
            <Select
              options={[
                'New',
                'Contacted',
                'Interested',
                'Site Visit',
                'Negotiation',
                'Booking',
                'Converted',
                'Not Interested',
                'Lost',
              ].map((v) => ({ value: v, label: v }))}
            />
          ),
        },
        {
          name: 'interestedProject',
          label: 'Interested Project',
          input: <Select allowClear options={projects.map((p) => ({ value: p._id, label: p.name }))} />,
        },
        { name: 'budget', label: 'Budget', input: <InputNumber style={{ width: '100%' }} /> },
        { name: 'notes', label: 'Notes', input: <Input.TextArea rows={2} /> },
      ]}
      extraActions={(record, reload) =>
        record.status !== 'Converted' ? (
          <Button
            size="small"
            onClick={async () => {
              await api.post(`/leads/${record._id}/convert`);
              reload();
            }}
          >
            Convert
          </Button>
        ) : null
      }
    />
  );
}
