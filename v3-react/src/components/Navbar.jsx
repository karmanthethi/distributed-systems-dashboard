import { useNavigate, useLocation } from 'react-router-dom';
import { Activity, LogOut, Plus, Flame, RefreshCw, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar({ user, logout, showAddApi, stressInfo }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { isTesting, handleStressTest } = stressInfo || {};

    const getLinkStyle = (path) => ({
        color: location.pathname.startsWith(path) ? 'var(--text-primary)' : 'var(--text-secondary)',
        fontWeight: 500,
        textDecoration: 'none',
        position: 'relative',
        padding: '0.5rem 0'
    });

    return (
        <nav style={{ background: 'var(--bg-surface-solid)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border-color)', padding: '0 2rem', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                <img src="/logo.png" alt="ServiceWatch" style={{ height: 40, width: 'auto', filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.3))' }} />
                <span style={{ fontSize: '1.3rem', fontWeight: 700, background: 'linear-gradient(90deg, #10b981, #f43f5e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>ServiceWatch V3</span>
            </div>

            <div style={{ display: 'flex', gap: '2rem' }}>
                <a href="/dashboard" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }} style={getLinkStyle('/dashboard')}>Dashboard</a>
                <a href="/services" onClick={(e) => { e.preventDefault(); navigate('/services'); }} style={getLinkStyle('/services')}>APIs</a>
                <a href="/analytics" onClick={(e) => { e.preventDefault(); navigate('/analytics'); }} style={getLinkStyle('/analytics')}>Analytics</a>
                <a href="/settings" onClick={(e) => { e.preventDefault(); navigate('/settings'); }} style={getLinkStyle('/settings')}>Settings</a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {handleStressTest && (
                    <motion.button whileHover={{ scale: 1.05 }} onClick={handleStressTest} disabled={isTesting}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', background: isTesting ? '#64748b' : 'linear-gradient(135deg, #f43f5e, #e11d48)', border: 'none', borderRadius: 10, color: 'white', fontWeight: 600, cursor: isTesting ? 'not-allowed' : 'pointer' }}>
                        {isTesting ? <><RefreshCw size={18} className="spin" /> Testing...</> : <><Flame size={18} /> Stress Test</>}
                    </motion.button>
                )}

                {showAddApi && (
                    <motion.button whileHover={{ scale: 1.05 }} onClick={showAddApi}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: 10, color: '#0f172a', fontWeight: 600, cursor: 'pointer' }}>
                        <Plus size={18} /> Add API
                    </motion.button>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 50 }}>
                    <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #10b981, #f43f5e)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>
                        {user?.email?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{user?.name || user?.email?.split('@')[0] || 'User'}</span>
                </div>

                <button onClick={() => { logout(); navigate('/login'); }} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><LogOut size={20} /></button>
            </div>
        </nav>
    );
}
