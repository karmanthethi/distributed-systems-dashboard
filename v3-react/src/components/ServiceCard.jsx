import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';

export default function ServiceCard({ api, metrics, delay, onDetails, onDelete }) {
    const status = metrics.status || 'pending';
    const color = status === 'healthy' ? '#22c55e' : status === 'degraded' ? '#eab308' : status === 'down' ? '#ef4444' : '#64748b';

    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay }} whileHover={{ scale: 1.02 }}
            style={{ background: 'rgba(30, 41, 59, 0.9)', border: `1px solid ${color}30`, borderRadius: 20, padding: '1.5rem', cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.25rem' }}>{api.name}</h3>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'JetBrains Mono' }}>{api.url?.substring(0, 35)}...</span>
                </div>
                <span style={{ padding: '0.3rem 0.6rem', background: `${color}20`, color, borderRadius: 20, fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'fit-content' }}>{status}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                <MetricBox label="LATENCY" value={`${Math.round(metrics.avgLatency || 0)}ms`} color="#10b981" />
                <MetricBox label="UPTIME" value={`${metrics.availability || 100}%`} color="#f43f5e" />
                <MetricBox label="REQUESTS" value={metrics.totalRequests || 0} color="#eab308" />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onDetails}
                    style={{ flex: 1, padding: '0.7rem', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: 12, color: '#0f172a', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
                    Analytics
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={(e) => { e.stopPropagation(); onDelete && onDelete(); }}
                    style={{ padding: '0.7rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 12, color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trash2 size={18} />
                </motion.button>
            </div>
        </motion.div>
    );
}

function MetricBox({ label, value, color }) {
    return (
        <div style={{ textAlign: 'center', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: 10 }}>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{label}</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color, fontFamily: 'JetBrains Mono' }}>{value}</div>
        </div>
    );
}
