import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const formSchema = z.object({
    name: z.string().min(2),
    phone: z.string().min(10),
    email: z.string().email(),
    course: z.string(),
    message: z.string().optional(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Validate
        const validation = formSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: validation.error.errors }, { status: 400 });
        }

        const { name, phone, email, course, message } = validation.data;

        // Save to DB
        // Wrapped in try-catch specifically for DB connection errors during dev
        try {
            const enquiry = await prisma.enquiry.create({
                data: {
                    name,
                    phone,
                    email,
                    course,
                    message,
                },
            });
            return NextResponse.json({ success: true, id: enquiry.id });
        } catch (dbError) {
            console.error("Database Error:", dbError);
            // Fallback for demo/dev without DB
            if (process.env.NODE_ENV === "development") {
                console.log("Mocking successful submission due to DB error");
                return NextResponse.json({ success: true, id: "mock-id", warning: "DB connection failed, using mock" });
            }
            return NextResponse.json({ error: "Failed to save enquiry" }, { status: 500 });
        }

    } catch (error) {
        console.error("Request Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
