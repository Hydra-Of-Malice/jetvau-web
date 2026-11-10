"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { COMPANY_INFO, NAV_LINKS } from "@/lib/constants";

interface CourseLink {
    _id: string;
    slug: string;
    title: string;
}

export function Footer() {
    const [courses, setCourses] = useState<CourseLink[]>([]);

    useEffect(() => {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        fetch(`${API_BASE}/courses`)
            .then((res) => res.json())
            .then((data) => setCourses(data.courses || []))
            .catch(() => { });
    }, []);

    return (
        <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
            <div className="container">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    {/* Brand */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-white tracking-tight">{COMPANY_INFO.name}</h3>
                        <p className="text-sm leading-relaxed max-w-xs">
                            Empowering the next generation of aviators with DGCA-certified drone training.
                            Join the future of aerial technology in Jabalpur.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <Link href={COMPANY_INFO.socials.facebook} className="hover:text-[var(--color-secondary)] transition-colors"><Facebook size={20} /></Link>
                            <Link href={COMPANY_INFO.socials.instagram} className="hover:text-[var(--color-secondary)] transition-colors"><Instagram size={20} /></Link>
                            <Link href={COMPANY_INFO.socials.linkedin} className="hover:text-[var(--color-secondary)] transition-colors"><Linkedin size={20} /></Link>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white">Quick Links</h4>
                        <ul className="space-y-2">
                            {NAV_LINKS.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm hover:text-[var(--color-secondary)] transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <Link href="/privacy" className="text-sm hover:text-[var(--color-secondary)] transition-colors">Privacy Policy</Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-sm hover:text-[var(--color-secondary)] transition-colors">Terms of Service</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Courses */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white">Our Courses</h4>
                        <ul className="space-y-2">
                            {courses.length > 0 ? (
                                courses.map((course) => (
                                    <li key={course._id}>
                                        <Link href={`/courses/${course.slug}`} className="text-sm hover:text-[var(--color-secondary)] transition-colors">
                                            {course.title}
                                        </Link>
                                    </li>
                                ))
                            ) : (
                                <li>
                                    <Link href="/courses" className="text-sm hover:text-[var(--color-secondary)] transition-colors">
                                        View All Courses
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white">Contact Us</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin size={20} className="text-[var(--color-secondary)] shrink-0 mt-1" />
                                <span className="text-sm">{COMPANY_INFO.location}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={20} className="text-[var(--color-secondary)] shrink-0" />
                                <a href={`tel:${COMPANY_INFO.phone}`} className="text-sm hover:text-white">{COMPANY_INFO.phone}</a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={20} className="text-[var(--color-secondary)] shrink-0" />
                                <a href={`mailto:${COMPANY_INFO.email}`} className="text-sm hover:text-white">{COMPANY_INFO.email}</a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
                    <p>&copy; {new Date().getFullYear()} {COMPANY_INFO.name}. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
