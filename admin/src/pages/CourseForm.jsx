import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../lib/api';
import { compressImage, totalImageChars, MAX_TOTAL_IMAGE_CHARS } from '../lib/images';
import { Save, ArrowLeft, Plus, X } from 'lucide-react';

const MAX_SOURCE_FILE_BYTES = 15 * 1024 * 1024;

// "₹10,000" -> "10000"
const priceStringToNumber = (value) => (value ? String(value).replace(/[^\d.]/g, '') : '');

const formatPrice = (num) => '₹' + Number(num).toLocaleString('en-IN');

export default function CourseForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [saving, setSaving] = useState(false);
    const [processingImages, setProcessingImages] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        title: '',
        category: 'Certification',
        duration: '',
        displayPrice: '',
        originalPrice: '',
        images: [],
        description: '',
        features: [''],
        syllabus: [{ day: 'Day 1', title: '', description: '' }],
        isActive: true,
    });

    useEffect(() => {
        if (!isEdit) return;
        setLoading(true);
        api.get(`/courses/admin/${id}`)
            .then((res) => {
                const course = res.data.course;
                const images = course.images?.length ? course.images : course.image ? [course.image] : [];
                setForm({
                    title: course.title || '',
                    category: course.category || 'Certification',
                    duration: course.duration || '',
                    displayPrice: course.price ? String(course.price / 100) : '',
                    originalPrice: priceStringToNumber(course.originalPrice),
                    images,
                    description: course.description || '',
                    features: course.features?.length ? course.features : [''],
                    syllabus: course.syllabus?.length ? course.syllabus : [{ day: 'Day 1', title: '', description: '' }],
                    isActive: course.isActive !== false,
                });
            })
            .catch((err) => setLoadError(err.response?.data?.error || 'Failed to load course'))
            .finally(() => setLoading(false));
    }, [id, isEdit]);

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleImageChange = async (e) => {
        const files = Array.from(e.target.files || []);
        e.target.value = '';
        if (files.length === 0) return;

        setError('');
        setProcessingImages(true);
        try {
            const added = [];
            for (const file of files) {
                if (!file.type.startsWith('image/')) {
                    throw new Error(`${file.name} is not an image`);
                }
                if (file.size > MAX_SOURCE_FILE_BYTES) {
                    throw new Error(`${file.name} is larger than 15 MB`);
                }
                added.push(await compressImage(file));
            }

            if (totalImageChars([...form.images, ...added]) > MAX_TOTAL_IMAGE_CHARS) {
                throw new Error('These images are too large together. Remove some images or use smaller ones.');
            }
            setForm((prev) => ({ ...prev, images: [...prev.images, ...added] }));
        } catch (err) {
            setError(err.message);
        } finally {
            setProcessingImages(false);
        }
    };

    const removeImage = (idx) => {
        setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
    };

    const handleFeatureChange = (idx, value) => {
        setForm((prev) => {
            const features = [...prev.features];
            features[idx] = value;
            return { ...prev, features };
        });
    };

    const addFeature = () => setForm((prev) => ({ ...prev, features: [...prev.features, ''] }));
    const removeFeature = (idx) => setForm((prev) => ({ ...prev, features: prev.features.filter((_, i) => i !== idx) }));

    const handleSyllabusChange = (idx, field, value) => {
        setForm((prev) => {
            const syllabus = [...prev.syllabus];
            syllabus[idx] = { ...syllabus[idx], [field]: value };
            return { ...prev, syllabus };
        });
    };

    const addSyllabusItem = () =>
        setForm((prev) => ({
            ...prev,
            syllabus: [...prev.syllabus, { day: `Day ${prev.syllabus.length + 1}`, title: '', description: '' }],
        }));
    const removeSyllabusItem = (idx) =>
        setForm((prev) => ({ ...prev, syllabus: prev.syllabus.filter((_, i) => i !== idx) }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const price = Number(form.displayPrice);
        if (!Number.isFinite(price) || price < 1) {
            setError('Price must be at least ₹1');
            return;
        }
        const originalPrice = form.originalPrice ? Number(form.originalPrice) : null;
        if (originalPrice !== null && (!Number.isFinite(originalPrice) || originalPrice < price)) {
            setError('MRP must be a number greater than or equal to the price');
            return;
        }

        // Syllabus items need a title and description; the API rejects partial ones
        const incomplete = form.syllabus.find((s) => s.title.trim() && !s.description.trim());
        if (incomplete) {
            setError(`Add a description for syllabus item "${incomplete.title}"`);
            return;
        }

        const payload = {
            title: form.title.trim(),
            category: form.category,
            duration: form.duration.trim(),
            price: Math.round(price * 100), // paise, for Razorpay
            displayPrice: formatPrice(price),
            originalPrice: originalPrice !== null ? formatPrice(originalPrice) : '',
            // The API uses the first image as the cover, so it isn't sent twice
            images: form.images,
            description: form.description.trim(),
            features: form.features.map((f) => f.trim()).filter(Boolean),
            syllabus: form.syllabus
                .filter((s) => s.title.trim())
                .map((s) => ({ day: s.day.trim() || 'Day', title: s.title.trim(), description: s.description.trim() })),
            isActive: form.isActive,
        };

        setSaving(true);
        try {
            if (isEdit) {
                await api.put(`/courses/${id}`, payload);
            } else {
                await api.post('/courses', payload);
            }
            navigate('/courses');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save course');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-secondary border-t-transparent rounded-full" aria-label="Loading"></div>
            </div>
        );
    }

    if (loadError) {
        return (
            <div>
                <p className="text-red-600 mb-4">{loadError}</p>
                <button type="button" onClick={() => navigate('/courses')} className="text-secondary font-medium hover:underline">
                    Back to courses
                </button>
            </div>
        );
    }

    const inputClass = 'w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-secondary outline-none';

    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <button
                    type="button"
                    onClick={() => navigate('/courses')}
                    className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                    aria-label="Back to courses"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{isEdit ? 'Edit course' : 'New course'}</h1>
                    <p className="text-slate-500 text-sm mt-1">{isEdit ? 'Update course details' : 'Create a new training program'}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 space-y-6 max-w-3xl">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label htmlFor="course-title" className="block text-sm font-medium text-slate-700 mb-1.5">Course title *</label>
                        <input
                            id="course-title"
                            type="text" required maxLength={200} value={form.title} onChange={(e) => handleChange('title', e.target.value)}
                            className={inputClass}
                            placeholder="Small Remote Pilot Certificate (RPC)"
                        />
                        {isEdit && <p className="text-xs text-slate-400 mt-1">Changing the title also changes the course URL</p>}
                    </div>
                    <div>
                        <label htmlFor="course-category" className="block text-sm font-medium text-slate-700 mb-1.5">Category *</label>
                        <select
                            id="course-category"
                            value={form.category} onChange={(e) => handleChange('category', e.target.value)}
                            className={`${inputClass} bg-white`}
                        >
                            <option value="Certification">Certification</option>
                            <option value="Specialization">Specialization</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="course-duration" className="block text-sm font-medium text-slate-700 mb-1.5">Duration *</label>
                        <input
                            id="course-duration"
                            type="text" required value={form.duration} onChange={(e) => handleChange('duration', e.target.value)}
                            className={inputClass}
                            placeholder="5 days"
                        />
                    </div>
                    <div>
                        <label htmlFor="course-price" className="block text-sm font-medium text-slate-700 mb-1.5">Price (₹) *</label>
                        <input
                            id="course-price"
                            type="number" required min="1" step="0.01" value={form.displayPrice} onChange={(e) => handleChange('displayPrice', e.target.value)}
                            className={inputClass}
                            placeholder="5000"
                        />
                        <p className="text-xs text-slate-400 mt-1">Customer pays this amount</p>
                    </div>
                    <div>
                        <label htmlFor="course-mrp" className="block text-sm font-medium text-slate-700 mb-1.5">Actual price / MRP (₹)</label>
                        <input
                            id="course-mrp"
                            type="number" min="0" step="0.01" value={form.originalPrice} onChange={(e) => handleChange('originalPrice', e.target.value)}
                            className={inputClass}
                            placeholder="10000"
                        />
                        <p className="text-xs text-slate-400 mt-1">Shown with strikethrough (optional)</p>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="course-images" className="block text-sm font-medium text-slate-700 mb-1.5">Course images</label>
                        <div className="flex flex-col gap-4">
                            <input
                                id="course-images"
                                type="file"
                                accept="image/*"
                                multiple
                                disabled={processingImages}
                                onChange={handleImageChange}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-secondary outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
                            />
                            <p className="text-xs text-slate-500">
                                {processingImages
                                    ? 'Optimizing images'
                                    : 'Images are resized to 1600px before upload. The first image is used as the cover.'}
                            </p>

                            {form.images.length > 0 && (
                                <div className="flex flex-wrap gap-4 mt-2">
                                    {form.images.map((src, idx) => (
                                        <div key={idx} className="relative group">
                                            <img src={src} alt={`Course image ${idx + 1}`} className="w-24 h-24 object-cover rounded-lg border border-slate-200" />
                                            {idx === 0 && (
                                                <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full">Cover</span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                aria-label={`Remove image ${idx + 1}`}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
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
                        <label htmlFor="course-description" className="block text-sm font-medium text-slate-700 mb-1.5">Description *</label>
                        <textarea
                            id="course-description"
                            required maxLength={5000} value={form.description} onChange={(e) => handleChange('description', e.target.value)}
                            className={`${inputClass} h-24`}
                            placeholder="What the course covers and who it is for"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                            <input
                                type="checkbox"
                                checked={form.isActive}
                                onChange={(e) => handleChange('isActive', e.target.checked)}
                                className="w-4 h-4 accent-secondary"
                            />
                            Show this course on the website
                        </label>
                    </div>
                </div>

                {/* Features */}
                <fieldset>
                    <legend className="block text-sm font-medium text-slate-700 mb-3">Features</legend>
                    {form.features.map((feat, idx) => (
                        <div key={idx} className="flex gap-2 mb-2">
                            <input
                                type="text" value={feat} onChange={(e) => handleFeatureChange(idx, e.target.value)}
                                aria-label={`Feature ${idx + 1}`}
                                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-secondary outline-none text-sm"
                                placeholder={`Feature ${idx + 1}`}
                            />
                            {form.features.length > 1 && (
                                <button type="button" onClick={() => removeFeature(idx)} aria-label={`Remove feature ${idx + 1}`} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={addFeature} className="flex items-center gap-1 text-sm text-secondary font-medium mt-2 hover:underline">
                        <Plus size={14} aria-hidden="true" /> Add feature
                    </button>
                </fieldset>

                {/* Syllabus */}
                <fieldset>
                    <legend className="block text-sm font-medium text-slate-700 mb-3">Syllabus</legend>
                    {form.syllabus.map((item, idx) => (
                        <div key={idx} className="bg-slate-50 p-4 rounded-lg mb-3 border border-slate-200">
                            <div className="flex items-center justify-between mb-3">
                                <input
                                    type="text" value={item.day} onChange={(e) => handleSyllabusChange(idx, 'day', e.target.value)}
                                    aria-label={`Syllabus item ${idx + 1} day`}
                                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium w-32"
                                />
                                {form.syllabus.length > 1 && (
                                    <button type="button" onClick={() => removeSyllabusItem(idx)} aria-label={`Remove syllabus item ${idx + 1}`} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                            <input
                                type="text" value={item.title} onChange={(e) => handleSyllabusChange(idx, 'title', e.target.value)}
                                aria-label={`Syllabus item ${idx + 1} title`}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm mb-2" placeholder="Title"
                            />
                            <input
                                type="text" value={item.description} onChange={(e) => handleSyllabusChange(idx, 'description', e.target.value)}
                                aria-label={`Syllabus item ${idx + 1} description`}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="Description"
                            />
                        </div>
                    ))}
                    <button type="button" onClick={addSyllabusItem} className="flex items-center gap-1 text-sm text-secondary font-medium mt-2 hover:underline">
                        <Plus size={14} aria-hidden="true" /> Add day
                    </button>
                </fieldset>

                {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

                {/* Submit */}
                <div className="flex gap-4 pt-4 border-t border-slate-200">
                    <button
                        type="submit" disabled={saving || processingImages}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                        {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" /> : <Save size={18} aria-hidden="true" />}
                        {isEdit ? 'Update course' : 'Create course'}
                    </button>
                    <button type="button" onClick={() => navigate('/courses')} className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
