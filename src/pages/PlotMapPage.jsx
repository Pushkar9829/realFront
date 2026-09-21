import { useEffect, useState } from 'react';
import { Select, Drawer, Descriptions, Tag, message, Spin, Empty } from 'antd';
import api from '../api/client';

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

export default function PlotMapPage() {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState(null);
  const [layout, setLayout] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get('/projects', { params: { limit: 100 } }).then((r) => {
      const items = r.data.data.items || [];
      setProjects(items);
      if (items[0]) setProjectId(items[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    api
      .get(`/plot-maps/${projectId}`)
      .then((r) => setLayout(r.data.data))
      .catch(() => {
        setLayout(null);
        message.info('No layout configured for this project yet');
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  return (
    <div>
      <h1 className="page-title">Digital Plot Map</h1>
      <p className="page-sub">Visual inventory — click a plot for details</p>
      <Select
        style={{ width: 320, marginBottom: 16 }}
        value={projectId}
        onChange={setProjectId}
        options={projects.map((p) => ({ value: p._id, label: p.name }))}
      />
      {loading ? (
        <Spin />
      ) : !layout ? (
        <Empty description="Upload a layout image via API /plot-maps/:projectId" />
      ) : (
        <div className="plot-map-wrap">
          <img src={`${API_ORIGIN}${layout.layoutImage}`} alt="Plot layout" />
          {(layout.hotspots || []).map((h) => {
            const status = h.plot?.status || 'Available';
            return (
              <div
                key={h._id}
                className={`hotspot status-${status}`}
                style={{
                  left: `${h.x}%`,
                  top: `${h.y}%`,
                  width: `${h.width}%`,
                  height: `${h.height}%`,
                }}
                onClick={() => setSelected(h.plot)}
                title={h.label || h.plot?.plotNumber}
              >
                {h.label || h.plot?.plotNumber}
              </div>
            );
          })}
        </div>
      )}

      <Drawer open={!!selected} onClose={() => setSelected(null)} title={selected?.plotNumber || 'Plot'}>
        {selected && (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Plot">{selected.plotNumber}</Descriptions.Item>
            <Descriptions.Item label="Block">{selected.block}</Descriptions.Item>
            <Descriptions.Item label="Phase">{selected.phase}</Descriptions.Item>
            <Descriptions.Item label="Size">{selected.plotSize}</Descriptions.Item>
            <Descriptions.Item label="Facing">{selected.facing}</Descriptions.Item>
            <Descriptions.Item label="Rate">₹{selected.rate}</Descriptions.Item>
            <Descriptions.Item label="Value">₹{selected.totalValue}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag>{selected.status}</Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}
