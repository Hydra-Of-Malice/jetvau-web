export const NAV_LINKS = [
    { name: "Home", href: "/" },
    { name: "Courses", href: "/courses" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
];

// Public site URL, used for metadata, sitemap and robots. Override with NEXT_PUBLIC_SITE_URL.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://jetvau.com").replace(/\/$/, "");

export const COMPANY_INFO = {
    name: "JetVau Aerospace",
    location: "Jabalpur, Madhya Pradesh",
    phone: "+91 98765 43210", // Placeholder
    whatsapp: "919876543210", // Placeholder: country code + number, digits only
    email: "admissions@jetvau.com", // Placeholder
    socials: {
        instagram: "https://instagram.com",
        linkedin: "https://linkedin.com",
        facebook: "https://facebook.com"
    }
};

export const PHONE_HREF = `tel:${COMPANY_INFO.phone.replace(/\s+/g, "")}`;
export const WHATSAPP_HREF = `https://wa.me/${COMPANY_INFO.whatsapp}`;
