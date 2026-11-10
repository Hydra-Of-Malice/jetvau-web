import { ShieldCheck, Award, Users, Briefcase } from "lucide-react";

const TRUST_ITEMS = [
    {
        icon: ShieldCheck,
        title: "DGCA Aligned",
        desc: "Authorized Curriculum"
    },
    {
        icon: Award,
        title: "Certified Instructors",
        desc: "Ex-Air Force Experts"
    },
    {
        icon: Users,
        title: "100% Safety Record",
        desc: "Standard Operating Procedures"
    },
    {
        icon: Briefcase,
        title: "Placement Support",
        desc: "Industry Connections"
    }
];

export function TrustBar() {
    return (
        <section className="bg-slate-50 border-b border-slate-100 py-12">
            <div className="container">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {TRUST_ITEMS.map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center space-y-3">
                            <div className="p-3 bg-white rounded-full shadow-sm text-[var(--color-primary)]">
                                <item.icon size={32} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">{item.title}</h3>
                                <p className="text-sm text-slate-500">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
