import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Plus, Pencil, EyeOff, Eye, BookOpen } from 'lucide-react';

export default function Courses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchCourses = () => {
        setLoading(true);
        setError('');
        // Admin list includes inactive courses so they can be edited and reactivated
        api.get('/courses/admin/all')
            .then((res) => setCourses(res.data.courses))
            .catch((err) => setError(err.response?.data?.error || 'Failed to load courses'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchCourses(); }, []);

    const handleDeactivate = async (id, title) => {
        if (!confirm(`Deactivate "${title}"? It will be hidden from the website. Existing enrollments are kept.`)) return;
        try {
            await api.delete(`/courses/${id}`);
            fetchCourses();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to deactivate course');
        }
    };

    const handleActivate = async (id) => {
        try {
            await api.put(`/courses/${id}`, { isActive: true });
            fetchCourses();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to activate course');
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Courses</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your training programs</p>
                </div>
                <Link
                    to="/courses/new"
                    className="flex items-center gap-2 bg-secondary text-white px-4 py-2.5 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                >
                    <Plus size={18} aria-hidden="true" />
                    Add course
                </Link>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin w-8 h-8 border-4 border-secondary border-t-transparent rounded-full" aria-label="Loading"></div>
                </div>
            ) : error ? (
                <p className="text-red-600">{error}</p>
            ) : courses.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <BookOpen size={48} className="mx-auto text-slate-300 mb-4" aria-hidden="true" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">No courses yet</h3>
                    <p className="text-slate-500 mb-4">Create your first course to get started.</p>
                    <Link to="/courses/new" className="text-secondary font-medium hover:underline">
                        Add course
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 text-xs font-medium text-slate-500">
                            <tr>
                                <th className="px-6 py-3 text-left">Title</th>
                                <th className="px-6 py-3 text-left">Category</th>
                                <th className="px-6 py-3 text-left">Duration</th>
                                <th className="px-6 py-3 text-left">Price</th>
                                <th className="px-6 py-3 text-left">Status</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {courses.map((course) => (
                                <tr key={course._id} className={`hover:bg-slate-50 ${course.isActive ? '' : 'text-slate-400'}`}>
                                    <td className="px-6 py-4">
                                        <p className={`text-sm font-medium ${course.isActive ? 'text-slate-900' : 'text-slate-500'}`}>{course.title}</p>
                                        <p className="text-xs text-slate-400">/{course.slug}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${course.category === 'Certification'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-purple-100 text-purple-700'
                                            }`}>
                                            {course.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{course.duration}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-900 tabular-nums">{course.displayPrice}</td>
                                    <td className="px-6 py-4 text-sm">
                                        {course.isActive ? (
                                            <span className="text-green-700">Active</span>
                                        ) : (
                                            <span className="text-slate-500">Hidden</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-4 whitespace-nowrap">
                                        <Link
                                            to={`/courses/edit/${course._id}`}
                                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                                        >
                                            <Pencil size={14} aria-hidden="true" /> Edit
                                        </Link>
                                        {course.isActive ? (
                                            <button
                                                type="button"
                                                onClick={() => handleDeactivate(course._id, course.title)}
                                                className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
                                            >
                                                <EyeOff size={14} aria-hidden="true" /> Deactivate
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => handleActivate(course._id)}
                                                className="inline-flex items-center gap-1 text-sm text-green-700 hover:text-green-900"
                                            >
                                                <Eye size={14} aria-hidden="true" /> Activate
                                            </button>
                                        )}
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
