import { Quote, Star } from "lucide-react";

const TESTIMONIALS = [
    {
        name: "Vikram Sharma",
        role: "Surveyor, L&T",
        content: "The Small RPC training at JetVau was intense and practical. The instructors ensured I was field-ready. I got placed within 2 weeks of certification.",
        rating: 5
    },
    {
        name: "Priya Gupta",
        role: "Freelance Drone Pilot",
        content: "Best drone institute in MP. The simulator training helped me build confidence before flying the actual drone. Highly recommended!",
        rating: 5
    },
    {
        name: "Rahul Verma",
        role: "Agriculture Entrepreneur",
        content: "I took the course to start my agri-spraying business. The guidance on regulations and business setup was invaluable.",
        rating: 5
    }
];

export function Testimonials() {
    return (
        <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-20 left-20 w-64 h-64 bg-[var(--color-secondary)] rounded-full blur-[100px]" />
            </div>

            <div className="container relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4">Success Stories</h2>
                    <p className="text-slate-400">Join 500+ satisfied pilots trained by us.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {TESTIMONIALS.map((testi, idx) => (
                        <div key={idx} className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700">
                            <Quote className="text-[var(--color-secondary)] mb-4 opacity-50" size={32} />
                            <p className="text-slate-300 mb-6 italic">"{testi.content}"</p>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold">{testi.name}</h4>
                                    <span className="text-xs text-slate-500">{testi.role}</span>
                                </div>
                                <div className="flex gap-1 text-yellow-400">
                                    {[...Array(testi.rating)].map((_, i) => (
                                        <Star key={i} size={14} fill="currentColor" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
