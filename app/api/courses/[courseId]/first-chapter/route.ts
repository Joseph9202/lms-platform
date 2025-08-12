import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user has purchased the course
    const purchase = await db.purchase.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: params.courseId,
        }
      }
    });

    if (!purchase) {
      return new NextResponse("Not enrolled", { status: 403 });
    }

    // Get first published chapter of the course
    const firstChapter = await db.chapter.findFirst({
      where: {
        courseId: params.courseId,
        isPublished: true,
      },
      orderBy: {
        position: "asc"
      }
    });

    if (!firstChapter) {
      return NextResponse.json({ chapterId: null, message: "No chapters available" });
    }

    return NextResponse.json({ chapterId: firstChapter.id });
  } catch (error) {
    console.log("[FIRST_CHAPTER]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}