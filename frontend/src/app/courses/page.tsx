"use client";

import { useState, useEffect } from "react";
import { CourseCard } from "@/components/ui/CourseCard";
import { Loader2 } from "lucide-react";
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

export default function CoursesPage() {
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
        <div className="min-h-screen bg-slate-50 pt-24 pb-16">
            <div className="container">
                <div className="max-w-3xl mx-auto text-center mb-12 px-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Our training programs</h1>
                    <p className="text-base md:text-lg text-slate-600">
                        Choose the right path for your drone career. Whether you want to be a certified pilot or a specialized operator, we have the right course for you.
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <Loader2 className="w-8 h-8 animate-spin text-secondary" aria-label="Loading courses" />
                    </div>
                ) : courses.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-slate-500 text-lg">No courses are open for enrollment right now. Check back soon or contact us.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {courses.map((course) => (
                            <CourseCard
                                key={course._id}
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
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
