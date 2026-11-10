import { COMPANY_INFO } from "@/lib/constants";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms & Conditions | JetVau Aerospace",
    description: "Terms and conditions for JetVau Aerospace training services.",
};

export default function TermsPage() {
    return (
        <div className="container py-16 max-w-3xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
                Terms &amp; Conditions
            </h1>

            <div className="prose prose-gray max-w-none space-y-6">
                <p className="text-gray-600 leading-relaxed">
                    Last updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>

                <section>
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">
                        1. Agreement to Terms
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                        By accessing and using the services provided by {COMPANY_INFO.name},
                        you agree to be bound by these Terms and Conditions. If you do not
                        agree with any part of these terms, please do not use our services.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">
                        2. Training Programs
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                        All training programs offered by {COMPANY_INFO.name} are subject to
                        availability and may be modified or discontinued at any time. Course
                        content, schedules, and instructors may change without prior notice.
                        Certification is contingent upon successful completion of all required
                        coursework and assessments as determined by DGCA guidelines.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">
                        3. Enrollment &amp; Payment
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                        Enrollment is confirmed only upon receipt of full payment. All fees
                        are quoted in Indian Rupees (INR) and are inclusive of applicable
                        taxes unless stated otherwise. Payment can be made through our
                        secure online payment gateway powered by Razorpay.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">
                        4. Cancellation &amp; Refund Policy
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                        Cancellations made 7 or more days before the course start date are
                        eligible for a full refund minus processing fees. Cancellations made
                        within 7 days of the course start date may be eligible for a 50%
                        refund, subject to review. No refunds will be issued after the course
                        has commenced.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">
                        5. Code of Conduct
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                        All students are expected to maintain professional conduct during
                        training sessions. {COMPANY_INFO.name} reserves the right to dismiss
                        any student who engages in unsafe, disruptive, or inappropriate
                        behavior without refund.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">
                        6. Limitation of Liability
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                        {COMPANY_INFO.name} shall not be liable for any indirect, incidental,
                        or consequential damages arising out of or in connection with the use
                        of our training services. Our total liability shall not exceed the
                        amount paid by the student for the specific course in question.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">
                        7. Contact Us
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                        If you have any questions about these Terms &amp; Conditions, please
                        contact us at{" "}
                        <a
                            href={`mailto:${COMPANY_INFO.email}`}
                            className="text-[var(--color-secondary)] hover:underline"
                        >
                            {COMPANY_INFO.email}
                        </a>{" "}
                        or call us at{" "}
                        <a
                            href={`tel:${COMPANY_INFO.phone}`}
                            className="text-[var(--color-secondary)] hover:underline"
                        >
                            {COMPANY_INFO.phone}
                        </a>
                        .
                    </p>
                </section>
            </div>
        </div>
    );
}
