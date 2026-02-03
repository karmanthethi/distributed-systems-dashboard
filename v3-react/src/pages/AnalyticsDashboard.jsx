import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { useAuth } from '../context/AuthContext';
import ServiceCard from '../components/ServiceCard';
import { Activity, Clock, Server, Zap, AlertCircle } from 'lucide-react';

export default function AnalyticsDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [metrics, setMetrics] = useState({});
    const [userApis, setUserApis] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && user.token) {
            fetchApis();
            fetchMetrics();
        }
        const interval = setInterval(() => {
            fetchMetrics();
        }, 3000);
        return () => clearInterval(interval);
    }, [user]);

    const fetchApis = () => {
        fetch('/api/user/apis', { headers: { Authorization: `Bearer ${user?.token}` } })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setUserApis(data.apis || []);
                    setLoading(false);
                }
            });
    };

    const fetchMetrics = () => {
        fetch('/api/metrics').then(res => res.json()).then(data => {
            if (data.services) {
                setMetrics(data.services);
                updateHistory(data.services);
            }
        });
    };

    const updateHistory = (currentMetrics) => {
        const services = Object.entries(currentMetrics).map(([name, data]) => ({ name, ...data }));
        if (services.length === 0) return;

        const avgLatency = Math.round(services.reduce((a, s) => a + (s.avgLatency || 0), 0) / services.length);
        const totalReq = services.reduce((a, s) => a + (s.totalRequests || 0), 0);
        const totalErrors = services.reduce((a, s) => a + (s.failedRequests || 0), 0);
        const errorRate = totalReq > 0 ? (totalErrors / totalReq) * 100 : 0;

        setHistory(prev => {
            const newPoint = {
                time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                avgLatency,
                totalReq,
                errorRate,
                serviceSnapshot: services // Store snapshot for breakdown charts
            };
            const newHistory = [...prev, newPoint];
            if (newHistory.length > 20) newHistory.shift();
            return newHistory;
        });
    };

    // Derived Data for Charts
    const currentSnapshot = history[history.length - 1]?.serviceSnapshot || [];

    // 1. Latency Comparison (Bar)
    const latencyData = currentSnapshot
        .map(s => ({ name: s.name, latency: Math.round(s.avgLatency || 0) }))
        .sort((a, b) => b.latency - a.latency)
        .slice(0, 5);

    // 2. Traffic Distribution (Pie)
    const trafficData = currentSnapshot
        .map(s => ({ name: s.name, value: s.totalRequests || 0 }))
        .filter(s => s.value > 0);

    // 3. Stats
    const totalRequests = currentSnapshot.reduce((a, s) => a + (s.totalRequests || 0), 0);
    const avgSystemLatency = history[history.length - 1]?.avgLatency || 0;
    const activeServicesCount = currentSnapshot.filter(s => s.status === 'healthy').length;
    const globalErrorRate = history[history.length - 1]?.errorRate || 0;

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

    if (loading && userApis.length === 0) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Dashboard...</div>;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ paddingBottom: '4rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ width: 4, height: 24, background: 'linear-gradient(180deg, #10b981, #f43f5e)', borderRadius: 2 }}></span>
                Analytics Mission Control
            </h2>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <MetricCard title="System Health" value={`${(100 - globalErrorRate).toFixed(1)}%`} icon={<Activity size={24} />} color="#10b981" />
                <MetricCard title="Avg System Latency" value={`${avgSystemLatency}ms`} icon={<Clock size={24} />} color="#3b82f6" />
                <MetricCard title="Total Traffic" value={totalRequests.toLocaleString()} icon={<Zap size={24} />} color="#f59e0b" />
                <MetricCard title="Active Services" value={`${activeServicesCount}/${userApis.length}`} icon={<Server size={24} />} color="#8b5cf6" />
            </div>

            {/* Main Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <ChartBox title="Global Latency Trend (Live)">
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={history}>
                            <defs>
                                <linearGradient id="colorGlobalLat" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                            <Area type="monotone" dataKey="avgLatency" stroke="#3b82f6" fillOpacity={1} fill="url(#colorGlobalLat)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartBox>

                <ChartBox title="Top 5 Slowest Services">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={latencyData} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                            <XAxis type="number" stroke="#64748b" fontSize={12} />
                            <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={12} width={100} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                            <Bar dataKey="latency" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartBox>
            </div>

            {/* Secondary Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <ChartBox title="Traffic Distribution">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={trafficData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                                {trafficData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartBox>

                <ChartBox title="Global Error Rate Trend">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={history}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                            <Line type="monotone" dataKey="errorRate" stroke="#ef4444" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartBox>
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>All Monitored Services</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
                {userApis.map((api, i) => (
                    <ServiceCard
                        key={api.id}
                        api={api}
                        metrics={metrics[api.name] || {}}
                        delay={i * 0.1}
                        onDetails={() => navigate(`/analytics/${api.id}`)}
                    />
                ))}
            </div>
        </motion.div>
    );
}

function MetricCard({ title, value, icon, color }) {
    return (
        <div style={{ background: 'var(--bg-surface)', borderRadius: 16, padding: '1.5rem', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
                {icon}
            </div>
            <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>{title}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
            </div>
        </div>
    );
}

function ChartBox({ title, children }) {
    return (
        <div style={{ background: 'var(--bg-surface)', borderRadius: 20, padding: '1.5rem', border: '1px solid var(--border-color)' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 600 }}>{title}</h3>
            {children}
        </div>
    );
}
