"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiPost } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, Loader2, CheckCircle, AlertCircle } from "lucide-react";

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface EnrollButtonProps {
    courseId: string;
    courseName: string;
    coursePrice: string;
    isEnrolled?: boolean;
}

interface RazorpayResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

export function EnrollButton({ courseId, courseName, coursePrice, isEnrolled }: EnrollButtonProps) {
    const { user, token, isAuthenticated } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleEnroll = async () => {
        setError("");

        if (!isAuthenticated) {
            // Come back to this course after signing in
            router.push(`/login?next=${encodeURIComponent(pathname)}`);
            return;
        }

        if (typeof window === "undefined" || !window.Razorpay) {
            setError("The payment window is still loading. Please try again in a moment.");
            return;
        }

        setLoading(true);

        try {
            const data = await apiPost("/payments/create-order", { courseId }, token);

            const razorpay = new window.Razorpay({
                key: data.key,
                amount: data.order.amount,
                currency: data.order.currency,
                name: "JetVau Aerospace",
                description: `Enrollment: ${courseName}`,
                order_id: data.order.id,
                prefill: {
                    name: user?.name,
                    email: user?.email,
                    contact: user?.phone,
                },
                theme: {
                    color: "#EA580C",
                },
                modal: {
                    ondismiss: () => setLoading(false),
                },
                handler: async (response: RazorpayResponse) => {
                    setLoading(true);
                    try {
                        await apiPost(
                            "/payments/verify",
                            {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            },
                            token
                        );
                        router.push("/my-courses");
                    } catch (err) {
                        setError(
                            `${err instanceof Error ? err.message : "Payment verification failed"}. If money was deducted, contact us with payment ID ${response.razorpay_payment_id}.`
                        );
                        setLoading(false);
                    }
                },
            });

            razorpay.on("payment.failed", (resp: { error?: { description?: string } }) => {
                setError(resp?.error?.description || "Payment failed. Please try again.");
                setLoading(false);
            });

            razorpay.open();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
            setLoading(false);
        }
    };

    if (isEnrolled) {
        return (
            <div className="w-full flex items-center justify-center gap-2 text-lg h-12 bg-green-600 text-white rounded-lg font-semibold cursor-default shadow-sm">
                <CheckCircle size={20} aria-hidden="true" />
                Enrolled
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <Button
                className="w-full text-lg h-12"
                onClick={handleEnroll}
                disabled={loading}
                aria-busy={loading}
            >
                {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" aria-label="Processing" />
                ) : (
                    <>
                        <ShieldCheck size={18} className="mr-2" aria-hidden="true" />
                        Enroll now, {coursePrice}
                    </>
                )}
            </Button>
            {error && (
                <p role="alert" className="flex items-start gap-2 text-sm text-red-600">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
                    {error}
                </p>
            )}
        </div>
    );
}
