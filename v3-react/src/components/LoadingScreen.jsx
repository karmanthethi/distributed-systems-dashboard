import { motion } from 'framer-motion';

export default function LoadingScreen() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ width: 50, height: 50, border: '3px solid #1e293b', borderTop: '3px solid #10b981', borderRadius: '50%' }} />
        </div>
    );
}
