import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { Clock, Activity, AlertTriangle, CheckCircle } from 'lucide-react';

export default function Analytics() {
    const { user } = useAuth();
    const { apiId } = useParams();
    const navigate = useNavigate();
    const [api, setApi] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!apiId) { navigate('/services'); return; }
        if (user && user.token) {
            fetchData();
            const interval = setInterval(fetchData, 3000);
            return () => clearInterval(interval);
        }
    }, [apiId, user]);

    const fetchData = async () => {
        try {
            // Fetch API details
            const apiRes = await fetch('/api/user/apis', { headers: { Authorization: `Bearer ${user?.token}` } });
            const apiData = await apiRes.json();
            if (apiData.success) {
                const found = apiData.apis?.find(a => String(a.id) === String(apiId));
                if (found) setApi(found);
            }

            // Fetch History
            const histRes = await fetch(`/api/metrics/${apiId}/history`);
            const histData = await histRes.json();
            if (histData.success) {
                // Process history for charts
                const processed = histData.data.map(h => ({
                    ...h,
                    time: new Date(h.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    errorRate: h.success ? 0 : 100
                }));
                setHistory(processed);
            }
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch analytics', error);
        }
    };

    // Calculations
    const stats = useMemo(() => {
        if (!history.length) return {};
        const total = history.length;
        const failures = history.filter(h => !h.success).length;
        const successRate = ((total - failures) / total) * 100;
        const avgLat = history.reduce((a, b) => a + b.latency, 0) / total;
        const p95Lat = history.slice().sort((a, b) => a.latency - b.latency)[Math.floor(total * 0.95)]?.latency || 0;

        // MTBF (Approximate: total time window / failures)
        const timeWindowSeconds = (history[history.length - 1]?.timestamp - history[0]?.timestamp) / 1000;
        const mtbf = failures > 0 ? (timeWindowSeconds / failures).toFixed(1) : '∞';

        // Error breakdown
        const errors = {};
        history.filter(h => !h.success).forEach(h => {
            const type = h.failureType || 'Unknown';
            errors[type] = (errors[type] || 0) + 1;
        });
        const errorData = Object.entries(errors).map(([name, value]) => ({ name, value }));

        return { total, failures, successRate, avgLat, p95Lat, mtbf, errorData };
    }, [history]);

    if (loading || !api) return <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>Loading Analytics...</div>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingBottom: '4rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={() => navigate('/services')} style={{ background: 'rgba(30, 41, 59, 0.5)', border: 'none', color: '#94a3b8', width: 40, height: 40, borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{api.name}</h2>
                    <span style={{ color: '#10b981', fontSize: '0.85rem' }}>ID: {api.id} • {api.url}</span>
                </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <MetricCard title="Success Rate" value={`${stats.successRate?.toFixed(1)}%`} icon={<CheckCircle size={20} />} color={stats.successRate > 95 ? '#10b981' : '#ef4444'} />
                <MetricCard title="Avg Latency" value={`${Math.round(stats.avgLat)}ms`} icon={<Clock size={20} />} color="#3b82f6" />
                <MetricCard title="P95 Latency" value={`${stats.p95Lat}ms`} icon={<Activity size={20} />} color="#8b5cf6" />
                <MetricCard title="MTBF" value={`${stats.mtbf}s`} icon={<AlertTriangle size={20} />} color="#f59e0b" sub="Mean Time Between Failures" />
            </div>

            {/* Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '1.5rem' }}>

                {/* Latency Trend */}
                <ChartBox title="Latency Trend (Avg vs P95)">
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={history}>
                            <defs>
                                <linearGradient id="colorLat" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                            <Area type="monotone" dataKey="latency" name="Latency (ms)" stroke="#3b82f6" fillOpacity={1} fill="url(#colorLat)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartBox>

                {/* Request Outcomes */}
                <ChartBox title="Request Outcomes">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={history}> // Using history as base but stacked logic would be better aggregated
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12} />
                            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                            <Legend />
                            <Bar dataKey="latency" name="Response Time" fill="#10b981" stackId="a" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartBox>

                {/* Error Distribution */}
                <ChartBox title="Error Breakdown">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={stats.errorData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {stats.errorData?.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={['#ef4444', '#f59e0b', '#ec4899'][index % 3]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                    {stats.errorData?.length === 0 && <div style={{ textAlign: 'center', color: '#64748b', marginTop: '-150px' }}>No Errors Detected</div>}
                </ChartBox>

                {/* Availability Trend */}
                <ChartBox title="Availability & Stability">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={history}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                            <Line type="step" dataKey="success" name="Status" stroke="#10b981" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartBox>
            </div>
        </motion.div>
    );
}

function MetricCard({ title, value, icon, color, sub }) {
    return (
        <div style={{ background: 'rgba(30, 41, 59, 0.4)', borderRadius: 16, padding: '1.5rem', border: '1px solid rgba(51, 65, 85, 0.3)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
                {icon}
            </div>
            <div>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500 }}>{title}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>{value}</div>
                {sub && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{sub}</div>}
            </div>
        </div>
    );
}

function ChartBox({ title, children }) {
    return (
        <div style={{ background: 'rgba(30, 41, 59, 0.4)', borderRadius: 20, padding: '1.5rem', border: '1px solid rgba(51, 65, 85, 0.3)' }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#f8fafc', fontSize: '1.1rem', fontWeight: 600 }}>{title}</h3>
            {children}
        </div>
    );
}
