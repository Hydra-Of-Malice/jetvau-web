import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react';

export default function Courses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCourses = () => {
        setLoading(true);
        api.get('/courses')
            .then((res) => setCourses(res.data.courses))
            .catch((err) => console.error('Fetch courses error:', err))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchCourses(); }, []);

    const handleDelete = async (id, title) => {
        if (!confirm(`Deactivate "${title}"? It will be hidden from users.`)) return;
        try {
            await api.delete(`/courses/${id}`);
            fetchCourses();
        } catch (err) {
            alert('Failed to deactivate course');
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
                    className="flex items-center gap-2 bg-secondary text-white px-4 py-2.5 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
                >
                    <Plus size={18} />
                    Add Course
                </Link>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin w-8 h-8 border-4 border-secondary border-t-transparent rounded-full"></div>
                </div>
            ) : courses.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">No courses yet</h3>
                    <p className="text-slate-500 mb-4">Create your first course to get started.</p>
                    <Link to="/courses/new" className="text-secondary font-medium hover:underline">
                        + Add Course
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                            <tr>
                                <th className="px-6 py-3 text-left">Title</th>
                                <th className="px-6 py-3 text-left">Category</th>
                                <th className="px-6 py-3 text-left">Duration</th>
                                <th className="px-6 py-3 text-left">Price</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {courses.map((course) => (
                                <tr key={course._id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-medium text-slate-900">{course.title}</p>
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
                                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{course.displayPrice}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <Link
                                            to={`/courses/edit/${course._id}`}
                                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                                        >
                                            <Pencil size={14} /> Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(course._id, course.title)}
                                            className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 size={14} /> Remove
                                        </button>
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
