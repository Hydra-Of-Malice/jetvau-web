import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: {
                    DEFAULT: "#0F172A", // Deep Navy
                    foreground: "#FFFFFF",
                },
                secondary: {
                    DEFAULT: "#EA580C", // Vibrant Orange
                    foreground: "#FFFFFF",
                },
                muted: {
                    DEFAULT: "#F1F5F9",
                    foreground: "#64748B",
                }
            },
            fontFamily: {
                sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui"],
                mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
            },
        },
    },
    plugins: [],
};
export default config;
