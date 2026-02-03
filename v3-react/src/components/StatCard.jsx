import { motion } from 'framer-motion';

export default function StatCard({ title, value, icon, color }) {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -5, boxShadow: `0 20px 40px ${color}20` }}
            style={{ background: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: 20, padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</span>
                <span style={{ color, background: `${color}20`, padding: 8, borderRadius: 10 }}>{icon}</span>
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: 700, color, fontFamily: 'JetBrains Mono' }}>{value}</div>
        </motion.div>
    );
}
