import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        const email = sessionStorage.getItem('email');
        if (token && email) {
            setUser({
                email,
                token,
                name: sessionStorage.getItem('name') || email.split('@')[0]
            });
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (data.success) {
                sessionStorage.setItem('token', data.token);
                sessionStorage.setItem('email', email);
                const name = data.user?.name || email.split('@')[0];
                sessionStorage.setItem('name', name);

                setUser({ email, token: data.token, name });
                return { success: true };
            }
            return { success: false, error: data.error };
        } catch (e) {
            return { success: false, error: 'Network error' };
        }
    };

    const register = async (email, password) => {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            return await res.json();
        } catch (e) {
            return { success: false, error: 'Network error' };
        }
    };

    const logout = () => {
        sessionStorage.clear();
        setUser(null);
    };

    return <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>;
}
