import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../lib/api';
import { Save, ArrowLeft, Plus, X } from 'lucide-react';

export default function CourseForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [imagesPreview, setImagesPreview] = useState([]);
    const [form, setForm] = useState({
        title: '',
        category: 'Certification',
        duration: '',
        displayPrice: '',
        originalPrice: '',
        image: '',
        images: [],
        description: '',
        features: [''],
        syllabus: [{ day: 'Day 1', title: '', description: '' }],
    });

    useEffect(() => {
        if (isEdit) {
            setLoading(true);
            api.get(`/courses`)
                .then((res) => {
                    const course = res.data.courses.find((c) => c._id === id);
                    if (course) {
                        setForm({
                            title: course.title || '',
                            category: course.category || 'Certification',
                            duration: course.duration || '',
                            displayPrice: String(course.price / 100) || '',
                            originalPrice: course.originalPrice || '',
                            image: course.image || '',
                            images: course.images || [],
                            description: course.description || '',
                            features: course.features?.length ? course.features : [''],
                            syllabus: course.syllabus?.length ? course.syllabus : [{ day: 'Day 1', title: '', description: '' }],
                        });
                        if (course.images && course.images.length > 0) {
                            setImagesPreview(course.images);
                        } else if (course.image) {
                            setImagesPreview([course.image]);
                        }
                    }
                })
                .finally(() => setLoading(false));
        }
    }, [id, isEdit]);

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const newPreviews = [];

        files.forEach((file) => {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert(`Image ${file.name} size should be less than 5MB`);
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                newPreviews.push(reader.result);

                // Once all valid files are processed
                if (newPreviews.length === files.filter(f => f.size <= 5 * 1024 * 1024).length) {
                    setImagesPreview((prev) => [...prev, ...newPreviews]);
                    setForm((prev) => {
                        const updatedImages = [...prev.images, ...newPreviews];
                        return {
                            ...prev,
                            images: updatedImages,
                            image: prev.image || updatedImages[0] || ''
                        };
                    });
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (idx) => {
        setImagesPreview(prev => prev.filter((_, i) => i !== idx));
        setForm(prev => {
            const updatedImages = prev.images.filter((_, i) => i !== idx);
            return {
                ...prev,
                images: updatedImages,
                image: updatedImages[0] || ''
            };
        });
    };

    const handleFeatureChange = (idx, value) => {
        const updated = [...form.features];
        updated[idx] = value;
        setForm((prev) => ({ ...prev, features: updated }));
    };

    const addFeature = () => setForm((prev) => ({ ...prev, features: [...prev.features, ''] }));
    const removeFeature = (idx) => setForm((prev) => ({ ...prev, features: prev.features.filter((_, i) => i !== idx) }));

    const handleSyllabusChange = (idx, field, value) => {
        const updated = [...form.syllabus];
        updated[idx] = { ...updated[idx], [field]: value };
        setForm((prev) => ({ ...prev, syllabus: updated }));
    };

    const addSyllabusItem = () =>
        setForm((prev) => ({
            ...prev,
            syllabus: [...prev.syllabus, { day: `Day ${prev.syllabus.length + 1}`, title: '', description: '' }],
        }));
    const removeSyllabusItem = (idx) =>
        setForm((prev) => ({ ...prev, syllabus: prev.syllabus.filter((_, i) => i !== idx) }));

    const formatPrice = (num) => {
        return '₹' + Number(num).toLocaleString('en-IN');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const payload = {
            title: form.title,
            category: form.category,
            duration: form.duration,
            price: Math.round(parseFloat(form.displayPrice) * 100), // Convert to paise for Razorpay
            displayPrice: formatPrice(form.displayPrice),
            originalPrice: form.originalPrice ? formatPrice(form.originalPrice) : '',
            image: form.image,
            images: form.images,
            description: form.description,
            features: form.features.filter((f) => f.trim()),
            syllabus: form.syllabus.filter((s) => s.title.trim()),
        };

        try {
            if (isEdit) {
                await api.put(`/courses/${id}`, payload);
            } else {
                await api.post('/courses', payload);
            }
            navigate('/courses');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to save course');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-secondary border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate('/courses')} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{isEdit ? 'Edit Course' : 'New Course'}</h1>
                    <p className="text-slate-500 text-sm mt-1">{isEdit ? 'Update course details' : 'Create a new training program'}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 space-y-6 max-w-3xl">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Course Title *</label>
                        <input
                            type="text" required value={form.title} onChange={(e) => handleChange('title', e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-secondary outline-none"
                            placeholder="Small Remote Pilot Certificate (RPC)"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Category *</label>
                        <select
                            value={form.category} onChange={(e) => handleChange('category', e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-secondary outline-none bg-white"
                        >
                            <option value="Certification">Certification</option>
                            <option value="Specialization">Specialization</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Duration *</label>
                        <input
                            type="text" required value={form.duration} onChange={(e) => handleChange('duration', e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-secondary outline-none"
                            placeholder="5 Days"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Display Price (₹) *</label>
                        <input
                            type="number" required value={form.displayPrice} onChange={(e) => handleChange('displayPrice', e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-secondary outline-none"
                            placeholder="5000"
                        />
                        <p className="text-xs text-slate-400 mt-1">Customer pays this amount</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Actual Price / MRP (₹)</label>
                        <input
                            type="number" value={form.originalPrice} onChange={(e) => handleChange('originalPrice', e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-secondary outline-none"
                            placeholder="10000"
                        />
                        <p className="text-xs text-slate-400 mt-1">Shown with strikethrough (optional)</p>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Course Images *</label>
                        <div className="flex flex-col gap-4">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-secondary outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-opacity-90 transition-all cursor-pointer"
                            />
                            <p className="text-xs text-slate-500 mt-1">Select multiple images (Max 5MB each). The first image will be used as the cover.</p>

                            {imagesPreview.length > 0 && (
                                <div className="flex flex-wrap gap-4 mt-2">
                                    {imagesPreview.map((src, idx) => (
                                        <div key={idx} className="relative group">
                                            <img src={src} alt={`Preview ${idx + 1}`} className="w-24 h-24 object-cover rounded-lg border border-slate-200" />
                                            {idx === 0 && (
                                                <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full">Cover</span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Description *</label>
                        <textarea
                            required value={form.description} onChange={(e) => handleChange('description', e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-secondary outline-none h-24"
                            placeholder="Course description..."
                        />
                    </div>
                </div>

                {/* Features */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Features</label>
                    {form.features.map((feat, idx) => (
                        <div key={idx} className="flex gap-2 mb-2">
                            <input
                                type="text" value={feat} onChange={(e) => handleFeatureChange(idx, e.target.value)}
                                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-secondary outline-none text-sm"
                                placeholder={`Feature ${idx + 1}`}
                            />
                            {form.features.length > 1 && (
                                <button type="button" onClick={() => removeFeature(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={addFeature} className="flex items-center gap-1 text-sm text-secondary font-medium mt-2 hover:underline">
                        <Plus size={14} /> Add Feature
                    </button>
                </div>

                {/* Syllabus */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Syllabus</label>
                    {form.syllabus.map((item, idx) => (
                        <div key={idx} className="bg-slate-50 p-4 rounded-lg mb-3 border border-slate-200">
                            <div className="flex items-center justify-between mb-3">
                                <input
                                    type="text" value={item.day} onChange={(e) => handleSyllabusChange(idx, 'day', e.target.value)}
                                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium w-32"
                                />
                                {form.syllabus.length > 1 && (
                                    <button type="button" onClick={() => removeSyllabusItem(idx)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                            <input
                                type="text" value={item.title} onChange={(e) => handleSyllabusChange(idx, 'title', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm mb-2" placeholder="Title"
                            />
                            <input
                                type="text" value={item.description} onChange={(e) => handleSyllabusChange(idx, 'description', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="Description"
                            />
                        </div>
                    ))}
                    <button type="button" onClick={addSyllabusItem} className="flex items-center gap-1 text-sm text-secondary font-medium mt-2 hover:underline">
                        <Plus size={14} /> Add Day
                    </button>
                </div>

                {/* Submit */}
                <div className="flex gap-4 pt-4 border-t border-slate-200">
                    <button
                        type="submit" disabled={saving}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50"
                    >
                        {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={18} />}
                        {isEdit ? 'Update Course' : 'Create Course'}
                    </button>
                    <button type="button" onClick={() => navigate('/courses')} className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
