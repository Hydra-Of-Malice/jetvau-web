import Image from "next/image";
import { Award, Briefcase } from "lucide-react";

const INSTRUCTORS = [
    {
        name: "Capt. Rajesh Singh",
        role: "Head Instructor",
        exp: "15+ Years Experience",
        bio: "Former Air Force pilot with over 2000 hours of flying experience. Certified DGCA Drone Instructor.",
        image: "/images/instructor-1.jpg" // Placeholder
    },
    {
        name: "Amit Patel",
        role: "Technical Lead",
        exp: "8+ Years Experience",
        bio: "Expert in drone maintenance and aerial survey mapping. specialized in GIS and photogrammetry.",
        image: "/images/instructor-2.jpg"
    }
];

export function Instructors() {
    return (
        <section className="py-20 bg-white">
            <div className="container">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Learn from the <span className="text-[var(--color-secondary)]">Best</span></h2>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        Our training is led by retired defense personnel and industry experts who bring real-world aviation discipline to drone operations.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {INSTRUCTORS.map((inst, idx) => (
                        <div key={idx} className="flex flex-col md:flex-row gap-6 items-center bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <div className="w-32 h-32 relative rounded-full overflow-hidden bg-slate-200 shrink-0 border-4 border-white shadow-md">
                                {/* Placeholder for real image */}
                                <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                                    Photo
                                </div>
                            </div>

                            <div className="text-center md:text-left">
                                <h3 className="text-xl font-bold text-slate-900">{inst.name}</h3>
                                <div className="text-[var(--color-secondary)] font-medium mb-2">{inst.role}</div>
                                <p className="text-sm text-slate-600 mb-4 leading-relaxed">{inst.bio}</p>

                                <div className="flex items-center justify-center md:justify-start gap-4 text-xs font-semibold text-slate-500">
                                    <div className="flex items-center gap-1">
                                        <Briefcase size={14} /> {inst.exp}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
