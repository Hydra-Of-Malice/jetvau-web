import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-white font-bold text-2xl mb-4">
                        JV
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Admin panel</h1>
                    <p className="text-slate-500 text-sm mt-1">Sign in to manage JetVau Aerospace</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-5">
                    {error && (
                        <div role="alert" className="flex items-center gap-2 bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                            <AlertCircle size={16} aria-hidden="true" />
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="admin-email" className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                        <input
                            id="admin-email"
                            autoComplete="username"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-colors"
                            placeholder="admin@jetvau.com"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="admin-password" className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                        <input
                            id="admin-password"
                            autoComplete="current-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-colors"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <LogIn size={18} />
                                Sign in
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
