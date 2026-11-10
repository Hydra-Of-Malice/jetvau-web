import { Target, Users, Plane, CheckCircle2 } from "lucide-react";

export function WhyUs() {
    return (
        <section className="py-20 bg-slate-50">
            <div className="container">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Content */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                                Why Choose <span className="text-[var(--color-secondary)]">JetVau?</span>
                            </h2>
                            <p className="text-lg text-slate-600">
                                We don't just teach you to fly; we train you to operate commercially.
                                Our curriculum goes beyond the basics to include real-world scenarios.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[
                                {
                                    icon: Users,
                                    title: "Small Batch Size",
                                    desc: "Personalized attention with 1:3 Instructor to Student ratio."
                                },
                                {
                                    icon: Plane,
                                    title: "Action Oriented",
                                    desc: "70% practical field training on actual DGCA-approved drones."
                                },
                                {
                                    icon: Target,
                                    title: "Career Focus",
                                    desc: "Dedicated placement cell for drone pilot jobs in MP."
                                },
                                {
                                    icon: CheckCircle2,
                                    title: "DGCA Compliant",
                                    desc: "Strict adherence to latest drone rules and safety protocols."
                                }
                            ].map((item, idx) => (
                                <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                    <div className="w-12 h-12 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mb-4">
                                        <item.icon size={24} />
                                    </div>
                                    <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                                    <p className="text-sm text-slate-600">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Image Side */}
                    <div className="relative h-[600px] bg-slate-200 rounded-3xl overflow-hidden shadow-xl lg:order-last order-first">
                        <div className="absolute inset-0 bg-slate-300 flex items-center justify-center text-slate-500">
                            Image: Student operating drone in field
                        </div>
                        {/* Decorative Elements */}
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[var(--color-secondary)] rounded-full blur-3xl opacity-20" />
                        <div className="absolute top-10 right-10 w-20 h-20 bg-[var(--color-primary)] rounded-full blur-2xl opacity-20" />
                    </div>

                </div>
            </div>
        </section>
    );
}
