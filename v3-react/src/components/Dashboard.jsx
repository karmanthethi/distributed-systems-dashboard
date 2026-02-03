import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Server, AlertTriangle, CheckCircle } from 'lucide-react';
import ServiceCard from './ServiceCard';
import AnalyticsModal from './AnalyticsModal';

export default function Dashboard() {
    const [metrics, setMetrics] = useState({});
    const [userApis, setUserApis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApiId, setSelectedApiId] = useState(null);

    useEffect(() => {
        // Initial fetch of APIs
        fetch('/api/user/apis', { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } }) // handled by proxy? need auth logic
            .then(res => res.json())
            .then(data => {
                if (data.success) setUserApis(data.apis || []);
                setLoading(false);
            })
            .catch(err => console.error(err));

        // Polling Metrics
        const interval = setInterval(() => {
            fetch('/api/metrics')
                .then(res => res.json())
                .then(data => {
                    if (data.services) setMetrics(data.services);
                });
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    // Calculate Aggregates
    const services = Object.values(metrics);
    const totalReq = services.reduce((acc, s) => acc + (s.totalRequests || 0), 0);
    const avgLatency = services.length ? Math.round(services.reduce((acc, s) => acc + (s.avgLatency || 0), 0) / services.length) : 0;
    const healthScore = services.length ? services.filter(s => s.status === 'healthy').length / services.length * 100 : 100;

    return (
        <div>
            {/* Stats Row */}
            <div className="stats-grid" style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem'
            }}>
                <StatCard title="Active Services" value={services.length} icon={<Server size={20} />} delay={0} />
                <StatCard title="Total Requests" value={totalReq.toLocaleString()} icon={<Activity size={20} />} delay={0.1} />
                <StatCard title="Avg Latency" value={`${avgLatency}ms`} icon={<Zap size={20} />} delay={0.2} />
                <StatCard title="System Health" value={`${Math.round(healthScore)}%`} icon={<ShieldCheck size={20} />} delay={0.3} color={healthScore > 90 ? '#10b981' : '#f59e0b'} />
            </div>

            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontFamily: 'Orbitron, sans-serif' }}>Monitored Services</h2>

            {/* Services Grid */}
            <div className="services-grid" style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem'
            }}>
                {userApis.map((api, index) => (
                    <ServiceCard
                        key={api.id}
                        api={api}
                        metrics={metrics[api.name] || {}}
                        delay={index * 0.1}
                        onOpenDetails={() => setSelectedApiId(api.id)}
                    />
                ))}
            </div>

            {/* Modal */}
            {selectedApiId && (
                <AnalyticsModal
                    api={userApis.find(a => a.id === selectedApiId)}
                    metrics={metrics[userApis.find(a => a.id === selectedApiId)?.name] || {}}
                    onClose={() => setSelectedApiId(null)}
                />
            )}
        </div>
    );
}

function StatCard({ title, value, icon, delay, color = '#00d4ff' }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            className="stat-card"
            style={{
                background: 'rgba(17, 24, 39, 0.7)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(75, 85, 99, 0.4)',
                borderRadius: '16px', // Rounded corners
                padding: '1.5rem',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span style={{ color: '#9ca3af', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>{title}</span>
                <span style={{ color: color, background: `${color}20`, padding: '8px', borderRadius: '8px' }}>{icon}</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', fontFamily: 'Orbitron, sans-serif', color: '#f0f4f8' }}>
                {value}
            </div>
            {/* Glow effect */}
            <div style={{
                position: 'absolute', top: '-50%', right: '-50%', width: '200px', height: '200px',
                background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`, pointerEvents: 'none'
            }} />
        </motion.div>
    )
}

function Zap({ size }) { return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg> }
