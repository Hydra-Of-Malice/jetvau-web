import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (token) {
            api.get('/auth/me')
                .then((res) => {
                    if (res.data.user.role === 'admin') {
                        setUser(res.data.user);
                    } else {
                        localStorage.removeItem('admin_token');
                    }
                })
                .catch(() => {
                    localStorage.removeItem('admin_token');
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/admin/login', { email, password });
        localStorage.setItem('admin_token', res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('admin_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
