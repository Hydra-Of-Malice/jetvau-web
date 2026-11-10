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
                                Why choose <span className="text-secondary">JetVau</span>
                            </h2>
                            <p className="text-lg text-slate-600">
                                We train you to fly and to operate commercially.
                                Our curriculum goes beyond the basics to include real-world scenarios.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[
                                {
                                    icon: Users,
                                    title: "Small batches",
                                    desc: "Personalized attention with a 1:3 instructor to student ratio."
                                },
                                {
                                    icon: Plane,
                                    title: "Hands-on training",
                                    desc: "70% practical field training on actual DGCA-approved drones."
                                },
                                {
                                    icon: Target,
                                    title: "Career focus",
                                    desc: "Dedicated placement cell for drone pilot jobs in MP."
                                },
                                {
                                    icon: CheckCircle2,
                                    title: "DGCA compliant",
                                    desc: "Strict adherence to latest drone rules and safety protocols."
                                }
                            ].map((item) => (
                                <div key={item.title} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                    <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                                        <item.icon size={24} aria-hidden="true" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                                    <p className="text-sm text-slate-600">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Image Side */}
                    {/* Photo slot: add public/images/why-us.jpg (student operating a drone in the field) */}
                    <div
                        className="relative h-80 lg:h-[600px] bg-slate-200 bg-cover bg-center rounded-3xl overflow-hidden shadow-sm lg:order-last order-first"
                        style={{ backgroundImage: "url('/images/why-us.jpg')" }}
                        role="img"
                        aria-label="Student operating a drone in the field"
                    />

                </div>
            </div>
        </section>
    );
}
