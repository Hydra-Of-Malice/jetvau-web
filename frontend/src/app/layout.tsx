import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingContact } from "@/components/layout/FloatingContact";
import { AuthProvider } from "@/contexts/AuthContext";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Best Drone Training in Jabalpur | Remote Pilot License (RPC) | JetVau Aerospace",
  description: "Join India's premier drone institute in Jabalpur, Madhya Pradesh. DGCA-approved Small RPC training. Start your career as a certified drone pilot today.",
  keywords: ["Drone Training Jabalpur", "Remote Pilot License India", "Small RPC Certification", "Drone Course Madhya Pradesh", "DGCA Drone Training"],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://jetvau.com",
    title: "JetVau Aerospace - Drone Training Institute",
    description: "Launch your career in aviation with our DGCA-approved drone pilot training.",
    siteName: "JetVau Aerospace",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />
      </head>
      <body
        className={`${inter.variable} antialiased min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <FloatingContact />
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
