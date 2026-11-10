import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy | JetVau Aerospace",
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white py-12">
            <div className="container max-w-3xl">
                <h1 className="text-3xl font-bold text-slate-900 mb-8">Privacy Policy</h1>

                <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
                    <p>Last updated: {new Date().toLocaleDateString()}</p>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">1. Information We Collect</h2>
                        <p>
                            We collect information you provide directly to us, such as when you fill out a form, request information, or contact us. This may include your name, email address, phone number, and any other information you choose to provide.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">2. How We Use Your Information</h2>
                        <p>
                            We use the information we collect to provide, maintain, and improve our services, to respond to your comments and questions, and to send you related information including confirmations, invoices, and updates.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">3. Data Security</h2>
                        <p>
                            We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">4. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@jetvau.com" className="text-blue-600 hover:underline">privacy@jetvau.com</a>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
