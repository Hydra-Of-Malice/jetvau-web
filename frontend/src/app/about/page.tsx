import type { Metadata } from "next";
import { Shield, Award, Users } from "lucide-react";

export const metadata: Metadata = {
    title: "About JetVau Aerospace | DGCA Approved Drone Institute",
    description: "Learn about our mission to train world-class drone pilots. JetVau Aerospace is committed to safety, compliance, and career growth.",
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero */}
            <div className="bg-slate-900 text-white py-20">
                <div className="container text-center max-w-3xl">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Empowering India's Drone Ecosystem</h1>
                    <p className="text-xl text-slate-300">
                        We are dedicated to producing the safest, most skilled remote pilots in the industry.
                    </p>
                </div>
            </div>

            <div className="container py-16">
                {/* Mission */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-6">Who We Are</h2>
                        <p className="text-lg text-slate-600 mb-4 leading-relaxed">
                            JetVau Aerospace is a premier Remote Pilot Training Organization (RPTO) based in Jabalpur, Madhya Pradesh.
                            Focused exclusively on the small drone category, we provide rigorous training that meets the highest standards of the DGCA.
                        </p>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            Our curriculum is designed not just for passing exams, but for real-world operational readiness in sectors like agriculture, surveillance, and cinematography.
                        </p>
                    </div>
                    <div className="bg-slate-100 rounded-2xl h-80 flex items-center justify-center text-slate-400">
                        About Image Placeholder
                    </div>
                </div>

                {/* Values */}
                <div className="bg-slate-50 rounded-3xl p-12">
                    <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Our Core Values</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] rounded-full flex items-center justify-center mb-6">
                                <Shield size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Safety First</h3>
                            <p className="text-slate-600">Zero compromise on safety protocols. We instill a safety-first mindset in every pilot.</p>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full flex items-center justify-center mb-6">
                                <Award size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Excellence</h3>
                            <p className="text-slate-600">Striving for perfection in every flight. We train precision and control.</p>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                                <Users size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Community</h3>
                            <p className="text-slate-600">Building a network of professional pilots to support India's drone ambitions.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
