export default function AnimatedBg() {
    return (
        <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
            <div style={{ position: 'absolute', top: '10%', left: '10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 60%)', filter: 'blur(60px)', animation: 'float 20s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '35vw', height: '35vw', background: 'radial-gradient(circle, rgba(244, 63, 94, 0.12) 0%, transparent 60%)', filter: 'blur(60px)', animation: 'float 25s ease-in-out infinite reverse' }} />
            <style>{`@keyframes float { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(30px, -30px); } }`}</style>
        </div>
    );
}
