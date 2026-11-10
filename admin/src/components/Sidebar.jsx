import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, BookOpen, MessageSquare, Users, LogOut } from 'lucide-react';

const links = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/courses', label: 'Courses', icon: BookOpen },
    { to: '/enquiries', label: 'Enquiries', icon: MessageSquare },
    { to: '/enrollments', label: 'Enrollments', icon: Users },
];

export default function Sidebar() {
    const { user, logout } = useAuth();

    return (
        <>
            <aside className="fixed left-0 top-0 h-screen w-64 bg-primary text-white flex flex-col z-50">
                {/* Logo */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center font-bold text-lg">
                            JV
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-tight">JetVau</h1>
                            <p className="text-xs text-slate-400">Admin Panel</p>
                        </div>
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 py-6 px-4 space-y-1">
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.to === '/'}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? 'bg-secondary text-white'
                                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                                }`
                            }
                        >
                            <link.icon size={20} aria-hidden="true" />
                            {link.label}
                        </NavLink>
                    ))}
                </nav>

                {/* User + Logout */}
                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                        <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{user?.name}</p>
                            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                        </div>
                        <button
                            type="button"
                            onClick={logout}
                            className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            title="Sign out"
                            aria-label="Sign out"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}

