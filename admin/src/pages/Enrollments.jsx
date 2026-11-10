import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Users } from 'lucide-react';

const STATUS_COLORS = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    PAID: 'bg-green-100 text-green-700',
    FAILED: 'bg-red-100 text-red-700',
};

export default function Enrollments() {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/admin/enrollments')
            .then((res) => setEnrollments(res.data.enrollments))
            .catch((err) => console.error('Fetch enrollments error:', err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Enrollments</h1>
                <p className="text-slate-500 text-sm mt-1">Track student registrations and payment status</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin w-8 h-8 border-4 border-secondary border-t-transparent rounded-full"></div>
                </div>
            ) : enrollments.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <Users size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700">No enrollments yet</h3>
                    <p className="text-slate-500">Enrollments will appear here after students register for courses.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                            <tr>
                                <th className="px-6 py-3 text-left">Student</th>
                                <th className="px-6 py-3 text-left">Course</th>
                                <th className="px-6 py-3 text-left">Amount</th>
                                <th className="px-6 py-3 text-left">Status</th>
                                <th className="px-6 py-3 text-left">Payment ID</th>
                                <th className="px-6 py-3 text-left">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {enrollments.map((enrollment) => (
                                <tr key={enrollment._id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-medium text-slate-900">{enrollment.user?.name || 'N/A'}</p>
                                        <p className="text-xs text-slate-400">{enrollment.user?.email || ''}</p>
                                        <p className="text-xs text-slate-400">{enrollment.user?.phone || ''}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-slate-700">{enrollment.course?.title || 'N/A'}</p>
                                        <p className="text-xs text-slate-400">{enrollment.course?.displayPrice || ''}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                        ₹{(enrollment.amount / 100).toLocaleString('en-IN')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[enrollment.status]}`}>
                                            {enrollment.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                                        {enrollment.razorpayPaymentId || '—'}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-400">
                                        {enrollment.paidAt
                                            ? new Date(enrollment.paidAt).toLocaleDateString('en-IN')
                                            : new Date(enrollment.createdAt).toLocaleDateString('en-IN')
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
