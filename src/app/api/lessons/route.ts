import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Lesson } from "@/models/Lesson";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const levelParams = searchParams.get("level");
        const languageParam = searchParams.get("language");

        const query: Record<string, string | number> = {};
        if (levelParams) query.level = parseInt(levelParams);
        if (languageParam) query.language = languageParam;

        const lessons = await Lesson.find(query).sort({ level: 1, order: 1 });

        return NextResponse.json({ lessons }, { status: 200 });
    } catch (error) {
        console.error("Lessons fetch error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
