"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, Loader2, CheckCircle } from "lucide-react";

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

export function EnrollButton({ courseId, courseName, coursePrice, isEnrolled }: EnrollButtonProps) {
    const { user, token, isAuthenticated } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleEnroll = async () => {
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }

        setLoading(true);

        try {
            const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

            const res = await fetch(`${API_BASE}/payments/create-order`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ courseId }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to create order");
            }

            // Open Razorpay checkout
            const options = {
                key: data.key,
                amount: data.order.amount,
                currency: data.order.currency,
                name: "JetVau Aerospace",
                description: `Enrollment: ${courseName}`,
                order_id: data.order.id,
                prefill: {
                    name: user?.name,
                    email: user?.email,
                },
                theme: {
                    color: "#EA580C",
                },
                handler: async (response: any) => {
                    try {
                        const verifyRes = await fetch(`${API_BASE}/payments/verify`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        });

                        const verifyData = await verifyRes.json();

                        if (verifyData.success) {
                            router.push("/my-courses");
                        } else {
                            alert("Payment verification failed. Please contact support.");
                        }
                    } catch {
                        alert("Payment verification error. Please contact support.");
                    }
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error: any) {
            alert(error.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    if (isEnrolled) {
        return (
            <div className="w-full flex items-center justify-center gap-2 text-lg h-12 bg-green-500 text-white rounded-lg font-semibold cursor-default shadow-sm border border-green-600">
                <CheckCircle size={20} />
                Enrolled
            </div>
        );
    }

    return (
        <Button
            className="w-full text-lg h-12"
            onClick={handleEnroll}
            disabled={loading}
        >
            {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                <>
                    <ShieldCheck size={18} className="mr-2" />
                    Enroll Now — {coursePrice}
                </>
            )}
        </Button>
    );
}
