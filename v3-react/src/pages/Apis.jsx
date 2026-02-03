import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Server, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ServiceCard from '../components/ServiceCard';
import AddApiModal from '../components/AddApiModal';

export default function Apis({ user }) {
    const [metrics, setMetrics] = useState({});
    const [userApis, setUserApis] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const navigate = useNavigate();
    const location = useLocation(); // Import useLocation

    // Check if we are in analytics view
    const isAnalyticsView = location.pathname === '/analytics';

    useEffect(() => {
        fetchApis();
        fetchMetrics();
        const interval = setInterval(fetchMetrics, 2000);
        return () => clearInterval(interval);
    }, []);

    const fetchApis = () => {
        fetch('/api/user/apis', { headers: { Authorization: `Bearer ${user?.token}` } })
            .then(res => res.json()).then(data => { if (data.success) setUserApis(data.apis || []); });
    };

    const fetchMetrics = () => {
        fetch('/api/metrics').then(res => res.json()).then(data => { if (data.services) setMetrics(data.services); });
    };

    const handleDeleteApi = async (apiId) => {
        if (!confirm('Delete this API?')) return;
        await fetch(`/api/user/apis/${apiId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${user?.token}` }
        });
        fetchApis();
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ width: 4, height: 24, background: 'linear-gradient(180deg, #10b981, #f43f5e)', borderRadius: 2 }}></span>
                    {isAnalyticsView ? 'Select API to View Analytics' : 'Monitored APIs'}
                </h2>
                {!isAnalyticsView && (
                    <motion.button whileHover={{ scale: 1.05 }} onClick={() => setShowAddModal(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: 10, color: '#0f172a', fontWeight: 600, cursor: 'pointer' }}>
                        <Plus size={18} /> Add API
                    </motion.button>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
                {userApis.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center', background: 'rgba(30, 41, 59, 0.5)', borderRadius: 20, border: '1px dashed rgba(16, 185, 129, 0.3)' }}>
                        <Server size={48} color="#64748b" style={{ marginBottom: '1rem' }} />
                        <p style={{ color: '#64748b', marginBottom: '1rem' }}>No APIs being monitored yet</p>
                        <button onClick={() => setShowAddModal(true)} style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: 10, color: '#0f172a', fontWeight: 600, cursor: 'pointer' }}>Add Your First API</button>
                    </div>
                )}
                {userApis.map((api, i) => (
                    <ServiceCard
                        key={api.id}
                        api={api}
                        metrics={metrics[api.name] || {}}
                        delay={i * 0.1}
                        onDetails={() => navigate(`/analytics/${api.id}`)}
                        onDelete={() => handleDeleteApi(api.id)}
                    />
                ))}
            </div>

            <AnimatePresence>
                {showAddModal && <AddApiModal onClose={() => setShowAddModal(false)} onAdd={() => { fetchApis(); setShowAddModal(false); }} token={user?.token} />}
            </AnimatePresence>
        </div>
    );
}
