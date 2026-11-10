import type { Metadata } from "next";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { COMPANY_INFO, PHONE_HREF } from "@/lib/constants";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export const metadata: Metadata = {
    title: "Contact JetVau Aerospace | Drone Training Jabalpur",
    description: "Visit our DGCA-approved training center in Jabalpur. Contact us for course details, fees, and upcoming batches.",
};

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container">
                <h1 className="text-4xl font-bold text-center text-slate-900 mb-12">Get in touch</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                            <h2 className="text-2xl font-bold text-slate-900">Training center</h2>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-secondary/10 text-secondary rounded-lg">
                                    <MapPin size={24} aria-hidden="true" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">Address</h3>
                                    <p className="text-slate-600 leading-relaxed">
                                        {COMPANY_INFO.location} <br />
                                        Near Airport Road, Jabalpur, MP - 482005
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-secondary/10 text-secondary rounded-lg">
                                    <Phone size={24} aria-hidden="true" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">Phone</h3>
                                    <a href={PHONE_HREF} className="text-slate-600 hover:text-primary">
                                        {COMPANY_INFO.phone}
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-secondary/10 text-secondary rounded-lg">
                                    <Mail size={24} aria-hidden="true" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">Email</h3>
                                    <a href={`mailto:${COMPANY_INFO.email}`} className="text-slate-600 hover:text-primary">
                                        {COMPANY_INFO.email}
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-secondary/10 text-secondary rounded-lg">
                                    <Clock size={24} aria-hidden="true" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">Hours</h3>
                                    <p className="text-slate-600">
                                        Mon to Sat: 9:00 AM to 6:00 PM <br />
                                        Sunday: Closed
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Map */}
                        <div className="bg-slate-200 h-64 rounded-2xl overflow-hidden flex items-center justify-center text-slate-500">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d117506.77660999537!2d79.8794821882297!3d23.160759020968943!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3981a94397365dd3%3A0x5f9a674c64d6e9b!2sJabalpur%2C%20Madhya%20Pradesh!5e0!3m2!1sen!2sin!4v1707765432100!5m2!1sen!2sin"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                title="Map of Jabalpur, Madhya Pradesh"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </div>

                    {/* Form */}
                    <div>
                        <EnquiryForm className="bg-white shadow-lg border border-slate-200" />
                    </div>

                </div>
            </div>
        </div>
    );
}
