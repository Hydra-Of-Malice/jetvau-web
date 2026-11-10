"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/Button";
import { apiGet, apiPost } from "@/lib/api";
import { cn } from "@/lib/utils";

const formSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
    phone: z.string().trim().regex(/^\d{10}$/, "Phone number must be 10 digits"),
    email: z.string().trim().email("Invalid email address"),
    course: z.string().min(1, "Please select a course"),
    message: z.string().max(2000, "Message is too long").optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CourseOption {
    _id: string;
    title: string;
}

const inputClass =
    "w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary outline-none transition-colors";

export function EnquiryForm({ className }: { className?: string }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [courses, setCourses] = useState<CourseOption[]>([]);

    useEffect(() => {
        apiGet("/courses")
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
        setSubmitError("");
        try {
            await apiPost("/enquiries", data);
            setIsSuccess(true);
            reset();
        } catch (error) {
            setSubmitError(
                error instanceof Error && error.message
                    ? error.message
                    : "Failed to submit enquiry. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div role="status" className={cn("bg-green-50 p-6 rounded-lg border border-green-200 text-center", className)}>
                <h3 className="text-xl font-bold text-green-800 mb-2">Thank you</h3>
                <p className="text-green-700">
                    We have received your enquiry. Our admissions team will contact you shortly.
                </p>
                <Button
                    variant="outline"
                    className="mt-4 border-green-600 text-green-800 hover:bg-green-100 hover:text-green-900"
                    onClick={() => setIsSuccess(false)}
                >
                    Send another enquiry
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className={cn("space-y-4 bg-white p-6 rounded-xl shadow-md border border-slate-100", className)}>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Enquire now</h3>

            <div>
                <label htmlFor="enquiry-name" className="block text-sm font-medium text-slate-700 mb-1">Full name</label>
                <input
                    id="enquiry-name"
                    {...register("name")}
                    autoComplete="name"
                    aria-invalid={!!errors.name}
                    className={cn(inputClass, errors.name ? "border-red-500" : "border-slate-300")}
                    placeholder="Your name"
                />
                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
            </div>

            <div>
                <label htmlFor="enquiry-phone" className="block text-sm font-medium text-slate-700 mb-1">Phone number</label>
                <input
                    id="enquiry-phone"
                    {...register("phone")}
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    aria-invalid={!!errors.phone}
                    className={cn(inputClass, errors.phone ? "border-red-500" : "border-slate-300")}
                    placeholder="10-digit mobile number"
                />
                {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>}
            </div>

            <div>
                <label htmlFor="enquiry-email" className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
                <input
                    id="enquiry-email"
                    {...register("email")}
                    type="email"
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    className={cn(inputClass, errors.email ? "border-red-500" : "border-slate-300")}
                    placeholder="you@example.com"
                />
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
            </div>

            <div>
                <label htmlFor="enquiry-course" className="block text-sm font-medium text-slate-700 mb-1">Course</label>
                <select
                    id="enquiry-course"
                    {...register("course")}
                    aria-invalid={!!errors.course}
                    className={cn(inputClass, "bg-white", errors.course ? "border-red-500" : "border-slate-300")}
                >
                    <option value="">Choose a course</option>
                    {courses.map((c) => (
                        <option key={c._id} value={c.title}>{c.title}</option>
                    ))}
                    <option value="Not sure yet">Not sure yet</option>
                </select>
                {errors.course && <p className="text-xs text-red-600 mt-1">{errors.course.message}</p>}
            </div>

            <div>
                <label htmlFor="enquiry-message" className="block text-sm font-medium text-slate-700 mb-1">Message (optional)</label>
                <textarea
                    id="enquiry-message"
                    {...register("message")}
                    className={cn(inputClass, "border-slate-300 h-24")}
                    placeholder="Your question"
                />
                {errors.message && <p className="text-xs text-red-600 mt-1">{errors.message.message}</p>}
            </div>

            {submitError && (
                <p role="alert" className="text-sm text-red-600">{submitError}</p>
            )}

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
                {isSubmitting ? "Sending" : "Send enquiry"}
            </Button>

            <p className="text-xs text-slate-500 text-center mt-2">
                We only use your details to reply to this enquiry.
            </p>
        </form>
    );
}
