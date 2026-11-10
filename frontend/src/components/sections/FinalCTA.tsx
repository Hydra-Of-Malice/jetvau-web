import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";

export function FinalCTA() {
    return (
        <section className="py-24 bg-[var(--color-secondary)] relative overflow-hidden">
            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "30px 30px" }}></div>

            <div className="container relative z-10 text-center text-white">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Launch Your Career?</h2>
                <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
                    Admissions open for the upcoming batch. Secure your spot in the fastest-growing industry.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button size="lg" className="bg-white text-[var(--color-secondary)] hover:bg-slate-100 border-none" asChild>
                        <Link href="/courses/small-rpc-certification">
                            Get Certified Now <ArrowRight className="ml-2" />
                        </Link>
                    </Button>
                    <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10" asChild>
                        <Link href="/contact">
                            Contact Admissions
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
