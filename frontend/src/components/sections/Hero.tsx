"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Hero() {
    return (
        <section className="relative h-[90vh] min-h-[600px] flex items-center overflow-hidden">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/images/hero-drone.jpg')" }} // Placeholder
            >
                <div className="absolute inset-0 bg-slate-900/70" /> {/* Dark Overlay */}
            </div>

            <div className="container relative z-10 text-white">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-3xl space-y-6"
                >
                    <div className="inline-block px-4 py-1.5 rounded-full bg-[var(--color-secondary)]/20 border border-[var(--color-secondary)] text-[var(--color-secondary)] font-semibold text-sm mb-4">
                        Authorized DGCA Training Partner
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                        Master <span className="text-[var(--color-secondary)]">Small Drone</span> Operations in Jabalpur
                    </h1>

                    <p className="text-lg md:text-xl text-slate-200 max-w-2xl leading-relaxed">
                        Get your <span className="font-semibold text-white">Remote Pilot Certificate (RPC)</span> and launch a high-flying career.
                        Join India's best drone training institute for hands-on practical experience.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button size="lg" className="gap-2" asChild>
                            <Link href="/courses">
                                Start Training <ArrowRight size={18} />
                            </Link>
                        </Button>

                        <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-slate-900 gap-2" asChild>
                            <Link href="https://wa.me/919876543210" target="_blank">
                                <MessageCircle size={18} />
                                Chat on WhatsApp
                            </Link>
                        </Button>
                    </div>

                    <p className="text-sm text-slate-400 pt-2">
                        * Limited seats available for next batch.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
