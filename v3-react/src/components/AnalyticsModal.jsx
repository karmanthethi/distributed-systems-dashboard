import { motion } from 'framer-motion';
import { X, Globe, Shield, Clock, Activity } from 'lucide-react';

export default function AnalyticsModal({ api, metrics, onClose }) {
    if (!api) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={e => e.stopPropagation()}
                style={{
                    background: '#0a0f1e', width: '1000px', maxWidth: '95%', maxHeight: '90vh',
                    borderRadius: '24px', border: '1px solid rgba(0, 212, 255, 0.2)',
                    boxShadow: '0 0 50px rgba(0,0,0,0.5)', overflow: 'hidden', display: 'flex', flexDirection: 'column'
                }}
            >
                {/* Header */}
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#f0f4f8', margin: 0, fontFamily: 'Orbitron' }}>{api.name} Analytics</h2>
                        <div style={{ fontSize: '0.9rem', color: '#64ffda', marginTop: '0.25rem' }}>Live Monitoring • 2s Interval</div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><X size={24} /></button>
                </div>

                {/* Scrollable Content */}
                <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>

                    {/* Top Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                        <Section title="Performance" icon={<Zap size={18} />}>
                            <Row label="Avg Latency" value={`${Math.round(metrics.avgLatency || 0)}ms`} />
                            <Row label="P95 Latency" value={`${Math.round(metrics.p95Latency || 0)}ms`} />
                            <Row label="Availability" value={`${metrics.availability || 100}%`} color="#10b981" />
                            <Row label="Packet Loss" value={`${metrics.packetLossRate || 0}%`} color="#ef4444" />
                        </Section>

                        <Section title="Network Timings" icon={<Globe size={18} />}>
                            <Row label="DNS Lookup" value={`${Math.round(metrics.avgDnsLookupTime || 0)}ms`} />
                            <Row label="TCP Connect" value={`${Math.round(metrics.avgTcpConnectionTime || 0)}ms`} />
                            <Row label="TLS Handshake" value={`${Math.round(metrics.avgTlsHandshakeTime || 0)}ms`} />
                            <Row label="TTFB" value={`${Math.round(metrics.avgTimeToFirstByte || 0)}ms`} />
                        </Section>
                    </div>

                    {/* Middle Grid */}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', marginBottom: '2rem' }}>
                        <h3 style={{ color: '#64ffda', marginBottom: '1.5rem', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Request Lifecycle</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <Section title="Throughput">
                                <Row label="Total Sent" value={metrics.totalRequests || 0} bold />
                                <Row label="Successful" value={metrics.successfulRequests || 0} color="#10b981" bold />
                                <Row label="Failed" value={metrics.failedRequests || 0} color="#ef4444" bold />
                            </Section>
                            <Section title="Error Breakdown">
                                <Row label="DNS Failures" value={metrics.dnsFailures || 0} />
                                <Row label="TLS Failures" value={metrics.tlsFailures || 0} />
                                <Row label="Timeouts" value={metrics.timeouts || 0} />
                                <Row label="Connection Refused" value={metrics.connectionFailures || 0} />
                            </Section>
                        </div>
                    </div>

                </div>
            </motion.div>
        </div>
    );
}

function Section({ title, children, icon }) {
    return (
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px' }}>
            <h4 style={{ color: '#00d4ff', marginBottom: '1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {icon} {title}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {children}
            </div>
        </div>
    )
}

function Row({ label, value, color = '#f0f4f8', bold }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
            <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>{label}</span>
            <span style={{ color: color, fontWeight: bold ? '700' : '500', fontFamily: bold ? 'Orbitron' : 'sans-serif' }}>{value}</span>
        </div>
    )
}

function Zap({ size }) { return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg> }
