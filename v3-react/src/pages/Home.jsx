import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Activity, Zap, Server } from 'lucide-react';

export default function Home() {
    const navigate = useNavigate();

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', zIndex: 1 }}>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
                style={{ textAlign: 'center', maxWidth: 800 }}>

                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.5rem 1rem', borderRadius: 50, marginBottom: '2rem' }}>
                    <span style={{ width: 8, height: 8, background: '#10b981', borderRadius: '50%', display: 'block' }}></span>
                    <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.9rem' }}>V3.0 Now Available</span>
                </div>

                <h1 style={{ fontSize: '4rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', background: 'linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Monitor APIs with <br />
                    <span style={{ background: 'linear-gradient(135deg, #10b981, #f43f5e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Extreme Precision</span>
                </h1>

                <p style={{ fontSize: '1.25rem', color: '#94a3b8', marginBottom: '3rem', lineHeight: 1.6 }}>
                    ServiceWatch V3 brings real-time monitoring, advanced analytics, and stress testing
                    to your distributed systems. All in a beautiful, dark-themed dashboard.
                </p>

                <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginBottom: '4rem' }}>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/register')}
                        style={{ padding: '1rem 2rem', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: 16, color: '#0f172a', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)' }}>
                        Get Started Free
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/login')}
                        style={{ padding: '1rem 2rem', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: 16, color: '#f8fafc', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer' }}>
                        Sign In
                    </motion.button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', textAlign: 'left' }}>
                    <Featurecard icon={<Activity color="#10b981" />} title="Real-time Metrics" desc="Monitor latency, uptime, and throughput with ms precision." />
                    <Featurecard icon={<Zap color="#eab308" />} title="Stress Testing" desc="Simulate high traffic loads to test service resilience." />
                    <Featurecard icon={<Shield color="#f43f5e" />} title="Secure & Private" desc="Enterprise-grade security for your monitoring data." />
                </div>

            </motion.div>
        </div>
    );
}

function Featurecard({ icon, title, desc }) {
    return (
        <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '1.5rem', borderRadius: 20, border: '1px solid rgba(51, 65, 85, 0.3)' }}>
            <div style={{ marginBottom: '1rem', background: 'rgba(15, 23, 42, 0.5)', width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{title}</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5 }}>{desc}</p>
        </div>
    );
}
