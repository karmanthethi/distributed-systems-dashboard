import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Settings as SettingsIcon, Clock, Zap, Moon, Sun, Monitor, Trash2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Settings() {
    const { user } = useAuth();
    const { theme, setTheme } = useTheme();
    const [checkInterval, setCheckInterval] = useState(5000);
    const [stressRate, setStressRate] = useState(10);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/auth/settings', {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            const data = await res.json();
            if (data.success) {
                setCheckInterval(data.settings.checkInterval);
                setStressRate(data.settings.stressRate);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch('/api/auth/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.token}`
                },
                body: JSON.stringify({ checkInterval, stressRate })
            });
            const data = await res.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'Settings saved successfully!' });
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to save settings' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Network error occurred' });
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        if (!window.confirm('Are you sure you want to clear all metrics metadata? This cannot be undone.')) return;

        setSaving(true);
        setMessage(null);
        try {
            const res = await fetch('/api/reset', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'All metrics have been reset.' });
            } else {
                setMessage({ type: 'error', text: 'Failed to reset metrics.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Network error occurred.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading settings...</div>;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <SettingsIcon size={24} color="#10b981" />
                    System Settings
                </h2>
                <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Customize global monitoring and testing parameters</p>
            </div>

            <div style={{ maxWidth: 600 }}>
                {message && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        style={{ padding: '1rem', borderRadius: 12, marginBottom: '1.5rem', background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: message.type === 'success' ? '#10b981' : '#ef4444', border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}30` }}>
                        {message.text}
                    </motion.div>
                )}

                <div style={{ background: 'var(--bg-surface)', borderRadius: 20, border: '1px solid var(--border-color)', backdropFilter: 'blur(10px)', overflow: 'hidden' }}>
                    <form onSubmit={handleSave} style={{ padding: '2rem' }}>

                        {/* Theme Selection */}
                        <div style={{ marginBottom: '2.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 500, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Monitor size={16} color="var(--primary)" /> Appearance
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                <ThemeOption label="Dark" value="dark" icon={<Moon size={18} />} current={theme} select={setTheme} color="#0f172a" />
                                <ThemeOption label="Light" value="light" icon={<Sun size={18} />} current={theme} select={setTheme} color="#f1f5f9" text="#0f172a" />
                                <ThemeOption label="Midnight" value="midnight" icon={<Monitor size={18} />} current={theme} select={setTheme} color="#020617" />
                            </div>
                        </div>

                        {/* Monitoring Interval */}
                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 500, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Clock size={16} color="var(--primary)" /> Normal Monitoring Interval
                            </label>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <input type="number" value={checkInterval} onChange={(e) => setCheckInterval(Number(e.target.value))} min="1000" step="1000"
                                    style={{ flex: 1, padding: '0.75rem', background: 'var(--bg-base)', border: '1px solid var(--border-color)', borderRadius: 10, color: 'var(--text-primary)', outline: 'none' }} />
                                <span style={{ color: 'var(--text-muted)' }}>ms</span>
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                                How often to check API health (default: 5000ms). Lower values increase load.
                            </p>
                        </div>

                        {/* Stress Test Rate */}
                        <div style={{ marginBottom: '2.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 500, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Zap size={16} color="var(--warning)" /> Stress Test Rate
                            </label>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <input type="number" value={stressRate} onChange={(e) => setStressRate(Number(e.target.value))} min="1" max="100"
                                    style={{ flex: 1, padding: '0.75rem', background: 'var(--bg-base)', border: '1px solid var(--border-color)', borderRadius: 10, color: 'var(--text-primary)', outline: 'none' }} />
                                <span style={{ color: 'var(--text-muted)' }}>req/s</span>
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                                Target requests per second during stress tests (default: 10). Max recommended: 50.
                            </p>
                        </div>

                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={saving}
                            style={{ width: '100%', padding: '1rem', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: 12, color: '#0f172a', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: saving ? 0.7 : 1 }}>
                            {saving ? 'Saving...' : <><Save size={18} /> Save Settings</>}
                        </motion.button>

                        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
                            <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 500, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <AlertCircle size={16} color="var(--error)" /> Danger Zone
                            </label>
                            <motion.button
                                type="button"
                                whileHover={{ scale: 1.02, backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleReset}
                                disabled={saving}
                                style={{ width: '100%', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)', borderRadius: 12, color: 'var(--error)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <Trash2 size={18} /> Reset All Metrics
                            </motion.button>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem', textAlign: 'center' }}>
                                This will clear all historical data and charts. This action cannot be undone.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </motion.div>
    );
}

function ThemeOption({ label, value, icon, current, select, color, text = '#f8fafc' }) {
    const isActive = current === value;
    return (
        <div onClick={() => select(value)}
            style={{
                cursor: 'pointer',
                borderRadius: 12,
                padding: '1rem',
                border: isActive ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                background: isActive ? 'var(--bg-elevated)' : 'var(--bg-base)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                transition: 'all 0.2s ease'
            }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: color, border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: text }}>
                {icon}
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>{label}</span>
        </div>
    );
}
