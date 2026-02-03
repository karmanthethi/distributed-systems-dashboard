import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => { if (user) navigate('/dashboard'); }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const result = await login(email, password);
        setLoading(false);
        if (result.success) navigate('/dashboard');
        else setError(result.error || 'Login failed');
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', zIndex: 1 }}>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                style={{ background: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 24, padding: '3rem', width: '100%', maxWidth: 420 }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <img src="/logo.png" alt="ServiceWatch" style={{ height: 80, width: 'auto', filter: 'drop-shadow(0 0 20px rgba(16, 185, 129, 0.4))' }} />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>Welcome Back</h1>
                    <p style={{ color: '#94a3b8' }}>Sign in to ServiceWatch V3</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                            style={{ width: '100%', padding: '0.875rem', background: '#0f172a', border: '1px solid #334155', borderRadius: 12, color: '#f8fafc', fontSize: '1rem', outline: 'none' }}
                            placeholder="Enter email" />
                    </div>
                    <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Password</label>
                        <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '0.875rem', paddingRight: '3rem', background: '#0f172a', border: '1px solid #334155', borderRadius: 12, color: '#f8fafc', fontSize: '1rem', outline: 'none' }}
                            placeholder="Enter password" />
                        <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: 38, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                            {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {error && <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 8, color: '#ef4444', fontSize: '0.9rem', marginBottom: '1rem' }}>{error}</div>}
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
                        style={{ width: '100%', padding: '1rem', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: 12, color: '#0f172a', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)' }}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </motion.button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#64748b' }}>
                    Don't have an account? <a href="/register" style={{ color: '#10b981', fontWeight: 500 }}>Register</a>
                </p>
            </motion.div>
        </div>
    );
}
