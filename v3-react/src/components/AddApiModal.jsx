import { useState } from 'react';
import { motion } from 'framer-motion';

export default function AddApiModal({ onClose, onAdd, token }) {
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch('/api/user/apis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ name, url })
        });
        const data = await res.json();
        if (data.success) onAdd();
        else setError(data.error || 'Failed to add');
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} onClick={e => e.stopPropagation()}
                style={{ background: '#1e293b', width: 450, borderRadius: 24, border: '1px solid rgba(16, 185, 129, 0.2)', padding: '2rem' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '1.5rem' }}>Add New API</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>API Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid #334155', borderRadius: 10, color: '#f8fafc', outline: 'none' }} placeholder="My API" />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>URL</label>
                        <input type="url" value={url} onChange={e => setUrl(e.target.value)} style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid #334155', borderRadius: 10, color: '#f8fafc', outline: 'none' }} placeholder="https://api.example.com" />
                    </div>
                    {error && <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 8, color: '#ef4444', marginBottom: '1rem' }}>{error}</div>}
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.75rem', background: '#334155', border: 'none', borderRadius: 10, color: '#f8fafc', cursor: 'pointer' }}>Cancel</button>
                        <button type="submit" style={{ flex: 1, padding: '0.75rem', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: 10, color: '#0f172a', fontWeight: 600, cursor: 'pointer' }}>Add API</button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}
