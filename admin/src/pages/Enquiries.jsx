import { useState, useEffect } from 'react';
import api from '../lib/api';
import { MessageSquare } from 'lucide-react';

const STATUS_OPTIONS = ['NEW', 'CONTACTED', 'CLOSED'];
const STATUS_LABELS = { NEW: 'New', CONTACTED: 'Contacted', CLOSED: 'Closed' };
const STATUS_COLORS = {
    NEW: 'bg-blue-100 text-blue-700',
    CONTACTED: 'bg-yellow-100 text-yellow-700',
    CLOSED: 'bg-green-100 text-green-700',
};

export default function Enquiries() {
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    const fetchEnquiries = () => {
        setLoading(true);
        const url = filter ? `/enquiries?status=${encodeURIComponent(filter)}` : '/enquiries';
        api.get(url)
            .then((res) => setEnquiries(res.data.enquiries))
            .catch((err) => console.error('Fetch enquiries error:', err))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchEnquiries(); }, [filter]);

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`/enquiries/${id}`, { status });
            fetchEnquiries();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Enquiries</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage lead queries from potential students</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!filter ? 'bg-primary text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                    >All</button>
                    {STATUS_OPTIONS.map((s) => (
                        <button
                            key={s} onClick={() => setFilter(s)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === s ? 'bg-primary text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                        >{STATUS_LABELS[s]}</button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin w-8 h-8 border-4 border-secondary border-t-transparent rounded-full"></div>
                </div>
            ) : enquiries.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" aria-hidden="true" />
                    <h3 className="text-lg font-semibold text-slate-700">No enquiries {filter ? `with status "${STATUS_LABELS[filter]}"` : 'yet'}</h3>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 text-xs font-medium text-slate-500">
                            <tr>
                                <th className="px-6 py-3 text-left">Name</th>
                                <th className="px-6 py-3 text-left">Contact</th>
                                <th className="px-6 py-3 text-left">Course</th>
                                <th className="px-6 py-3 text-left">Message</th>
                                <th className="px-6 py-3 text-left">Status</th>
                                <th className="px-6 py-3 text-left">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {enquiries.map((enquiry) => (
                                <tr key={enquiry._id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{enquiry.name}</td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-slate-600">{enquiry.email}</p>
                                        <p className="text-xs text-slate-400">{enquiry.phone}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{enquiry.course}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate" title={enquiry.message || ''}>{enquiry.message || '—'}</td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={enquiry.status}
                                            onChange={(e) => updateStatus(enquiry._id, e.target.value)}
                                            aria-label={`Status for ${enquiry.name}`}
                                            className={`px-2.5 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer ${STATUS_COLORS[enquiry.status]}`}
                                        >
                                            {STATUS_OPTIONS.map((s) => (
                                                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-400">
                                        {new Date(enquiry.createdAt).toLocaleDateString('en-IN')}
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
