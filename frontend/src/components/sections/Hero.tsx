"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { WHATSAPP_HREF } from "@/lib/constants";

export function Hero() {
    return (
        <section className="relative h-[90vh] min-h-[600px] flex items-center overflow-hidden bg-slate-900">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/images/hero-drone.jpg')" }} // Add public/images/hero-drone.jpg
            >
                <div className="absolute inset-0 bg-slate-900/70" /> {/* Dark Overlay */}
            </div>

            <div className="container relative z-10 text-white">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="max-w-3xl space-y-6"
                >
                    <p className="text-secondary font-medium text-sm">
                        Authorized DGCA training partner
                    </p>

                    <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                        Master <span className="text-secondary">small drone</span> operations in Jabalpur
                    </h1>

                    <p className="text-lg md:text-xl text-slate-200 max-w-2xl leading-relaxed">
                        Get your <span className="font-semibold text-white">Remote Pilot Certificate (RPC)</span> and launch a high-flying career.
                        Join India&apos;s best drone training institute for hands-on practical experience.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button variant="secondary" size="lg" className="gap-2" asChild>
                            <Link href="/courses">
                                Start training <ArrowRight size={18} aria-hidden="true" />
                            </Link>
                        </Button>

                        <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-slate-900 gap-2" asChild>
                            <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer">
                                <MessageCircle size={18} aria-hidden="true" />
                                Chat on WhatsApp
                            </a>
                        </Button>
                    </div>

                    <p className="text-sm text-slate-400 pt-2">
                        Limited seats in each batch
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
