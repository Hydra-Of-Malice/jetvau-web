"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CourseCard } from "@/components/ui/CourseCard";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet } from "@/lib/api";

interface Course {
    _id: string;
    slug: string;
    title: string;
    category: string;
    duration: string;
    displayPrice: string;
    originalPrice?: string;
    image: string;
    features: string[];
}

export function FeaturedCourses() {
    const { user, token } = useAuth();
    const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiGet("/courses")
            .then((data) => setCourses(data.courses || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (user && token) {
            apiGet("/payments/my-enrollments", token)
                .then((data) => {
                    const paidIds = data.enrollments
                        ?.filter((e: any) => e.status === "PAID" && e.course)
                        .map((e: any) => e.course._id) || [];
                    setEnrolledCourseIds(new Set(paidIds));
                })
                .catch(console.error);
        } else {
            setEnrolledCourseIds(new Set());
        }
    }, [user, token]);

    return (
        <section className="py-20 bg-white">
            <div className="container">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                    <div className="space-y-2 max-w-2xl">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                            Industry-ready <span className="text-secondary">drone training</span>
                        </h2>
                        <p className="text-slate-600 text-lg">
                            Authorized training for the Small Category Remote Pilot Certificate (RPC) and specialized operational courses.
                        </p>
                    </div>
                    <Link
                        href="/courses"
                        className="flex items-center gap-2 font-semibold text-primary hover:text-secondary transition-colors"
                    >
                        View all programs <ArrowRight size={20} aria-hidden="true" />
                    </Link>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <Loader2 className="w-8 h-8 animate-spin text-secondary" aria-label="Loading courses" />
                    </div>
                ) : courses.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-slate-500 text-lg">New courses are coming soon</p>
                    </div>
                ) : (
                    <div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {courses.slice(0, 3).map((course, idx) => (
                                <motion.div
                                    key={course._id}
                                    initial={{ opacity: 0, y: 12 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.05, duration: 0.3, ease: "easeOut" }}
                                >
                                    <CourseCard
                                        slug={course.slug}
                                        title={course.title}
                                        category={course.category}
                                        duration={course.duration}
                                        price={course.displayPrice}
                                        originalPrice={course.originalPrice}
                                        image={course.image}
                                        features={course.features}
                                        isEnrolled={enrolledCourseIds.has(course._id)}
                                    />
                                </motion.div>
                            ))}
                        </div>
                        {courses.length > 3 && (
                            <div className="text-center mt-12">
                                <Link
                                    href="/courses"
                                    className="inline-flex items-center gap-2 bg-secondary text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-orange-700 transition-colors shadow-sm"
                                >
                                    View all programs <ArrowRight size={20} aria-hidden="true" />
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
