import { useState, useEffect } from 'react';
import api from '../lib/api';
import StatsCard from '../components/StatsCard';
import { Users, BookOpen, MessageSquare, CreditCard, IndianRupee, TrendingUp } from 'lucide-react';

const ENQUIRY_LABELS = { NEW: 'New', CONTACTED: 'Contacted', CLOSED: 'Closed' };

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/admin/stats')
            .then((res) => setStats(res.data.stats))
            .catch((err) => console.error('Stats error:', err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-secondary border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!stats) {
        return <p className="text-red-500">Failed to load dashboard stats.</p>;
    }

    const revenue = (stats.totalRevenue / 100).toLocaleString('en-IN');

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-500 text-sm mt-1">Overview of your training platform</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatsCard title="Total users" value={stats.totalUsers} icon={Users} color="blue" />
                <StatsCard title="Active courses" value={stats.totalCourses} icon={BookOpen} color="orange" />
                <StatsCard title="Enquiries" value={stats.totalEnquiries} icon={MessageSquare} color="purple" />
                <StatsCard title="Paid enrollments" value={stats.paidEnrollments} icon={CreditCard} color="green" />
                <StatsCard title="Total revenue" value={`₹${revenue}`} icon={IndianRupee} color="green" />
                <StatsCard title="Total enrollments" value={stats.totalEnrollments} icon={TrendingUp} color="blue" />
            </div>

            {/* Recent Enquiries */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-900">Recent enquiries</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 text-xs font-medium text-slate-500">
                            <tr>
                                <th className="px-6 py-3 text-left">Name</th>
                                <th className="px-6 py-3 text-left">Email</th>
                                <th className="px-6 py-3 text-left">Course</th>
                                <th className="px-6 py-3 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {stats.recentEnquiries.map((enquiry) => (
                                <tr key={enquiry._id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{enquiry.name}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{enquiry.email}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{enquiry.course}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${enquiry.status === 'NEW' ? 'bg-blue-100 text-blue-700' :
                                                enquiry.status === 'CONTACTED' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-green-100 text-green-700'
                                            }`}>
                                            {ENQUIRY_LABELS[enquiry.status] || enquiry.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {stats.recentEnquiries.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">No enquiries yet</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
