"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
    email: z.string().email("Invalid email address"),
    course: z.string().min(1, "Please select a course"),
    message: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CourseOption {
    _id: string;
    title: string;
}

export function EnquiryForm({ className }: { className?: string }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [courses, setCourses] = useState<CourseOption[]>([]);

    useEffect(() => {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        fetch(`${API_BASE}/courses`)
            .then((res) => res.json())
            .then((data) => setCourses(data.courses || []))
            .catch(() => { });
    }, []);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
    });

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        try {
            const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
            const res = await fetch(`${API_BASE}/enquiries`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || "Submission failed");
            }

            setIsSuccess(true);
            reset();
        } catch (error) {
            console.error("Enquiry submission error:", error);
            alert("Failed to submit enquiry. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className={cn("bg-green-50 p-6 rounded-lg border border-green-200 text-center", className)}>
                <h3 className="text-xl font-bold text-green-800 mb-2">Thank you!</h3>
                <p className="text-green-700">
                    We have received your enquiry. Our admission team will contact you shortly.
                </p>
                <Button
                    variant="outline"
                    className="mt-4 border-green-600 text-green-800 hover:bg-green-100"
                    onClick={() => setIsSuccess(false)}
                >
                    Send Another Enquiry
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={cn("space-y-4 bg-white p-6 rounded-xl shadow-md border border-slate-100", className)}>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Enquire Now</h3>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                    {...register("name")}
                    className={cn(
                        "w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all",
                        errors.name ? "border-red-500" : "border-slate-300"
                    )}
                    placeholder="John Doe"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input
                    {...register("phone")}
                    type="tel"
                    className={cn(
                        "w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all",
                        errors.phone ? "border-red-500" : "border-slate-300"
                    )}
                    placeholder="9876543210"
                />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input
                    {...register("email")}
                    type="email"
                    className={cn(
                        "w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all",
                        errors.email ? "border-red-500" : "border-slate-300"
                    )}
                    placeholder="john@example.com"
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Course</label>
                <select
                    {...register("course")}
                    className={cn(
                        "w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all bg-white",
                        errors.course ? "border-red-500" : "border-slate-300"
                    )}
                >
                    <option value="">-- Choose a Course --</option>
                    {courses.map((c) => (
                        <option key={c._id} value={c.title}>{c.title}</option>
                    ))}
                </select>
                {errors.course && <p className="text-xs text-red-500 mt-1">{errors.course.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message (Optional)</label>
                <textarea
                    {...register("message")}
                    className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all h-24"
                    placeholder="I have a question about..."
                />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>

            <p className="text-xs text-slate-400 text-center mt-2">
                Your data is secure. We don&apos;t spam.
            </p>
        </form>
    );
}
