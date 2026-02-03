import Navbar from './Navbar';

export default function Layout({ children, user, logout, showAddApi, stressInfo }) {
    return (
        <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
            <Navbar user={user} logout={logout} showAddApi={showAddApi} stressInfo={stressInfo} />
            <main style={{ padding: '2rem', maxWidth: 1400, margin: '0 auto' }}>
                {children}
            </main>
        </div>
    );
}
