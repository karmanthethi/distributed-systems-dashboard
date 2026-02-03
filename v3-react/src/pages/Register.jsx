import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await register(email, password);
        if (result.success) { setSuccess(true); setTimeout(() => navigate('/login'), 1500); }
        else setError(result.error || 'Registration failed');
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', zIndex: 1 }}>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                style={{ background: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(244, 63, 94, 0.2)', borderRadius: 24, padding: '3rem', width: '100%', maxWidth: 420 }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <img src="/logo.png" alt="ServiceWatch" style={{ height: 80, width: 'auto', filter: 'drop-shadow(0 0 20px rgba(244, 63, 94, 0.4))' }} />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>Create Account</h1>
                    <p style={{ color: '#94a3b8' }}>Join ServiceWatch V3</p>
                </div>
                {success ? (
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} style={{ textAlign: 'center', padding: '2rem', color: '#10b981' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
                        <div>Account created! Redirecting...</div>
                    </motion.div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                style={{ width: '100%', padding: '0.875rem', background: '#0f172a', border: '1px solid #334155', borderRadius: 12, color: '#f8fafc', outline: 'none' }} placeholder="Enter email" />
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                                style={{ width: '100%', padding: '0.875rem', background: '#0f172a', border: '1px solid #334155', borderRadius: 12, color: '#f8fafc', outline: 'none' }} placeholder="Create password" />
                        </div>
                        {error && <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 8, color: '#ef4444', marginBottom: '1rem' }}>{error}</div>}
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
                            style={{ width: '100%', padding: '1rem', background: 'linear-gradient(135deg, #f43f5e, #e11d48)', border: 'none', borderRadius: 12, color: 'white', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>
                            Create Account
                        </motion.button>
                    </form>
                )}
                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#64748b' }}>
                    Already have an account? <a href="/login" style={{ color: '#f43f5e', fontWeight: 500 }}>Sign In</a>
                </p>
            </motion.div>
        </div>
    );
}
