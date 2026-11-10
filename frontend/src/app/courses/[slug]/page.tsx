"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { EnrollButton } from "@/components/ui/EnrollButton";
import { Clock, IndianRupee, MapPin, CheckCircle, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { COMPANY_INFO, PHONE_HREF } from "@/lib/constants";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet, resolveApiUrl } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

interface Course {
    _id: string;
    slug: string;
    title: string;
    category: string;
    duration: string;
    price: number;
    displayPrice: string;
    originalPrice?: string;
    image: string;
    images?: string[];
    description: string;
    features: string[];
    syllabus: { day?: string; title: string; description: string }[];
}

export default function CourseDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const { user, token } = useAuth();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [currentImageIdx, setCurrentImageIdx] = useState(0);
    const [direction, setDirection] = useState(0);

    const displayImages = (course?.images && course.images.length > 0
        ? course.images
        : (course?.image ? [course.image] : [])
    ).map((src) => resolveApiUrl(src));

    useEffect(() => {
        if (displayImages.length <= 1) return;
        const timer = setInterval(() => {
            setDirection(1);
            setCurrentImageIdx((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
        }, 4000);
        return () => clearInterval(timer);
    }, [displayImages.length, currentImageIdx]);

    useEffect(() => {
        apiGet(`/courses/${encodeURIComponent(slug)}`)
            .then((data) => setCourse(data.course))
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, [slug]);

    useEffect(() => {
        if (course && user && token) {
            apiGet("/payments/my-enrollments", token)
                .then((data) => {
                    const isPaid = data.enrollments?.some((e: any) => e.course?._id === course._id && e.status === "PAID");
                    setIsEnrolled(isPaid);
                })
                .catch(console.error);
        } else {
            setIsEnrolled(false);
        }
    }, [course, user, token]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-secondary" aria-label="Loading course" />
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Course not found</h1>
                <p className="text-gray-500 mb-6">The course you&apos;re looking for doesn&apos;t exist.</p>
                <Link href="/courses" className="text-secondary font-semibold hover:underline">
                    Browse courses
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header / Hero */}
            <div className="bg-slate-900 text-white pt-24 pb-12">
                <div className="container">
                    <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
                        <div className="flex-1 max-w-3xl">
                            <span className="inline-block px-3 py-1 rounded-full bg-secondary/20 text-secondary text-sm font-semibold mb-4">
                                {course.category}
                            </span>
                            <h1 className="text-3xl md:text-5xl font-bold mb-6">{course.title}</h1>
                            <p className="text-xl text-slate-300 mb-8 max-w-2xl">{course.description}</p>

                            <div className="flex flex-wrap gap-6 text-sm font-medium text-slate-400">
                                <div className="flex items-center gap-2">
                                    <Clock size={20} className="text-secondary" aria-hidden="true" />
                                    <span>{course.duration}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <IndianRupee size={20} className="text-secondary" aria-hidden="true" />
                                    <span>{course.displayPrice}</span>
                                    {course.originalPrice && (
                                        <span className="line-through text-slate-500 text-sm">{course.originalPrice}</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={20} className="text-secondary" aria-hidden="true" />
                                    <span>On-site, Jabalpur</span>
                                </div>
                            </div>
                        </div>
                        {displayImages.length > 0 && (
                            <div className="w-full md:w-1/3 max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-slate-700 relative group aspect-[4/3] bg-slate-800">
                                <AnimatePresence initial={false} custom={direction}>
                                    <motion.img
                                        key={currentImageIdx}
                                        src={displayImages[currentImageIdx]}
                                        alt={`${course.title}, image ${currentImageIdx + 1} of ${displayImages.length}`}
                                        custom={direction}
                                        variants={{
                                            enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
                                            center: { zIndex: 1, x: 0, opacity: 1 },
                                            exit: (dir: number) => ({ zIndex: 0, x: dir < 0 ? 300 : -300, opacity: 0 })
                                        }}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{ x: { duration: 0.3, ease: "easeOut" }, opacity: { duration: 0.2 } }}
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                </AnimatePresence>

                                {displayImages.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => {
                                                setDirection(-1);
                                                setCurrentImageIdx(prev => prev === 0 ? displayImages.length - 1 : prev - 1);
                                            }}
                                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-1.5 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100 transition-opacity z-10"
                                            aria-label="Previous image"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setDirection(1);
                                                setCurrentImageIdx(prev => prev === displayImages.length - 1 ? 0 : prev + 1);
                                            }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-1.5 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100 transition-opacity z-10"
                                            aria-label="Next image"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                                            {displayImages.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        setDirection(idx > currentImageIdx ? 1 : -1);
                                                        setCurrentImageIdx(idx);
                                                    }}
                                                    className={`w-2 h-2 rounded-full transition-colors ${idx === currentImageIdx ? 'bg-white' : 'bg-white/50 hover:bg-white/80'}`}
                                                    aria-label={`Go to image ${idx + 1}`}
                                                    aria-current={idx === currentImageIdx}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="container mt-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Overview */}
                        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">What you will learn</h2>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {course.features.map((feat, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <CheckCircle className="text-secondary shrink-0 mt-1" size={20} aria-hidden="true" />
                                        <span className="text-slate-700">{feat}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* Curriculum from DB */}
                        {course.syllabus && course.syllabus.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold text-slate-900 mb-6">Course syllabus</h2>
                                <div className="space-y-4">
                                    {course.syllabus.map((item, idx) => (
                                        <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200">
                                            {item.day && <p className="text-sm font-medium text-secondary mb-1">{item.day}</p>}
                                            <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                                            <p className="text-slate-600">{item.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                            <h3 className="text-xl font-bold mb-4">Secure your seat</h3>
                            <p className="text-sm text-slate-500 mb-6">
                                Seats are limited in each batch. Ask our admissions team about upcoming batch dates.
                            </p>

                            <div className="space-y-4">
                                <EnrollButton
                                    courseId={course._id}
                                    courseName={course.title}
                                    coursePrice={course.displayPrice}
                                    isEnrolled={isEnrolled}
                                />
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href="/contact">
                                        Have questions? Contact us
                                    </Link>
                                </Button>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <h4 className="font-semibold mb-2">Need help?</h4>
                                <p className="text-sm text-slate-500 mb-2">Call our admissions team</p>
                                <a href={PHONE_HREF} className="text-secondary font-bold hover:underline">
                                    {COMPANY_INFO.phone}
                                </a>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
