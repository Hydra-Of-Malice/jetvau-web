"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet, resolveApiUrl } from "@/lib/api";
import { BookOpen, Clock, ArrowRight, CheckCircle, Loader2 } from "lucide-react";

interface Enrollment {
    _id: string;
    status: string;
    paidAt: string | null;
    course: {
        _id: string;
        title: string;
        slug: string;
        category: string;
        duration: string;
        displayPrice: string;
        image: string;
    };
}

export default function MyCoursesPage() {
    const { user, token, loading: authLoading } = useAuth();
    const router = useRouter();
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.replace("/login?next=/my-courses");
            return;
        }

        apiGet("/payments/my-enrollments", token)
            // Skip enrollments whose course no longer exists
            .then((data) => setEnrollments((data.enrollments || []).filter((e: Enrollment) => e.course)))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user, token, authLoading, router]);

    if (authLoading || loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-secondary" aria-label="Loading" />
            </div>
        );
    }

    const paidEnrollments = enrollments.filter((e) => e.status === "PAID");
    const pendingEnrollments = enrollments.filter((e) => e.status === "PENDING");

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-16">
            <div className="container px-4">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900">My courses</h1>
                    <p className="text-gray-500 mt-2">
                        Courses you are enrolled in and payments in progress
                    </p>
                </div>

                {enrollments.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                        <BookOpen size={48} className="mx-auto text-gray-300 mb-4" aria-hidden="true" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            No courses yet
                        </h3>
                        <p className="text-gray-500 mb-6">
                            Explore our training programs and enroll today.
                        </p>
                        <Link
                            href="/courses"
                            className="inline-flex items-center gap-2 bg-secondary text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                        >
                            Browse courses
                            <ArrowRight size={18} aria-hidden="true" />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {paidEnrollments.length > 0 && (
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <CheckCircle size={20} className="text-green-600" aria-hidden="true" />
                                    Active enrollments ({paidEnrollments.length})
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {paidEnrollments.map((enrollment) => (
                                        <div
                                            key={enrollment._id}
                                            className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <div className="h-40 bg-primary flex items-center justify-center overflow-hidden">
                                                {enrollment.course.image ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={resolveApiUrl(enrollment.course.image)} alt="" loading="lazy" className="w-full h-full object-cover" />
                                                ) : (
                                                    <BookOpen size={40} className="text-white/80" aria-hidden="true" />
                                                )}
                                            </div>
                                            <div className="p-5">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                                                        Enrolled
                                                    </span>
                                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                                        <Clock size={12} aria-hidden="true" />
                                                        {enrollment.course.duration}
                                                    </span>
                                                </div>
                                                <h3 className="font-bold text-gray-900 mb-1">
                                                    {enrollment.course.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 mb-4">
                                                    {enrollment.course.category}
                                                </p>
                                                <Link
                                                    href={`/courses/${enrollment.course.slug}`}
                                                    className="text-sm text-secondary font-semibold hover:underline flex items-center gap-1"
                                                >
                                                    View details <ArrowRight size={14} aria-hidden="true" />
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {pendingEnrollments.length > 0 && (
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 mb-4">
                                    Pending payment ({pendingEnrollments.length})
                                </h2>
                                <div className="space-y-3">
                                    {pendingEnrollments.map((enrollment) => (
                                        <div
                                            key={enrollment._id}
                                            className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between gap-4"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {enrollment.course.title}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Payment pending, {enrollment.course.displayPrice}
                                                </p>
                                            </div>
                                            <Link
                                                href={`/courses/${enrollment.course.slug}`}
                                                className="text-sm bg-secondary text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors shrink-0"
                                            >
                                                Complete payment
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
