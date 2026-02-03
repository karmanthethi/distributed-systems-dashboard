import { useState, useEffect } from 'react';
import { Server, Activity, Zap } from 'lucide-react';
import StatCard from '../components/StatCard';

export default function Dashboard() {
    const [metrics, setMetrics] = useState({});
    const [anomalies, setAnomalies] = useState([]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 2000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = () => {
        fetch('/api/metrics').then(res => res.json()).then(data => { if (data.services) setMetrics(data.services); });
        fetch('/api/anomalies').then(res => res.json()).then(data => { if (data.success) setAnomalies(data.anomalies || []); });
    };

    const services = Object.entries(metrics).map(([key, value]) => ({ name: key, ...value }));
    const activeServices = services.filter(s => s.status === 'healthy' || s.status === 'degraded');
    const totalReq = services.reduce((a, s) => a + (s.totalRequests || 0), 0);
    const avgLat = services.length ? Math.round(services.reduce((a, s) => a + (s.avgLatency || 0), 0) / services.length) : 0;

    return (
        <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ width: 4, height: 24, background: 'linear-gradient(180deg, #10b981, #f43f5e)', borderRadius: 2 }}></span>
                System Overview
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <StatCard title="Active Services" value={activeServices.length} icon={<Server size={20} />} color="#10b981" />
                <StatCard title="Total Requests" value={totalReq.toLocaleString()} icon={<Activity size={20} />} color="#f43f5e" />
                <StatCard title="Avg Latency" value={`${avgLat}ms`} icon={<Zap size={20} />} color="#eab308" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div style={{ background: 'rgba(30, 41, 59, 0.4)', borderRadius: 20, padding: '1.5rem', border: '1px solid rgba(51, 65, 85, 0.3)' }}>
                    <h3 style={{ marginBottom: '1rem', color: '#94a3b8', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Highest Latency</h3>
                    {services.sort((a, b) => b.avgLatency - a.avgLatency).slice(0, 3).map(s => (
                        <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <span style={{ color: '#f8fafc' }}>{s.name}</span>
                            <span style={{ color: '#eab308', fontFamily: 'JetBrains Mono' }}>{Math.round(s.avgLatency || 0)}ms</span>
                        </div>
                    ))}
                    {services.length === 0 && <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No data available</p>}
                </div>

                <div style={{ background: 'rgba(30, 41, 59, 0.4)', borderRadius: 20, padding: '1.5rem', border: '1px solid rgba(51, 65, 85, 0.3)' }}>
                    <h3 style={{ marginBottom: '1rem', color: '#94a3b8', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Recent Anomalies</h3>
                    {anomalies.length > 0 ? anomalies.slice(0, 3).map((a, i) => (
                        <div key={i} style={{ padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem' }}>
                            <span style={{ color: '#ef4444', fontWeight: 600 }}>{a.type}</span> • <span style={{ color: '#94a3b8' }}>{a.service}</span>
                        </div>
                    )) : <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No anomalies detected</p>}
                </div>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.4)', borderRadius: 20, padding: '2rem', border: '1px solid rgba(51, 65, 85, 0.3)' }}>
                <h3 style={{ marginBottom: '1rem', color: '#94a3b8' }}>Quick Actions</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <a href="/services" style={{ padding: '0.75rem 1.5rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 10, color: '#10b981', fontWeight: 600 }}>Manage APIs</a>
                    <a href="/analytics" style={{ padding: '0.75rem 1.5rem', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.2)', borderRadius: 10, color: '#eab308', fontWeight: 600 }}>View Analytics</a>
                </div>
            </div>
        </div>
    );
}
