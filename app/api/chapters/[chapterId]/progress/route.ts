import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { chapterId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userProgress = await db.userProgress.findUnique({
      where: {
        userId_chapterId: {
          userId,
          chapterId: params.chapterId,
        },
      },
    });

    return NextResponse.json({
      isCompleted: userProgress?.isCompleted || false,
      progress: userProgress?.progress || 0,
    });
  } catch (error) {
    console.error("[CHAPTER_PROGRESS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { chapterId: string } }
) {
  try {
    const { userId } = auth();
    const { isCompleted, progress } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userProgress = await db.userProgress.upsert({
      where: {
        userId_chapterId: {
          userId,
          chapterId: params.chapterId,
        },
      },
      update: {
        isCompleted: !!isCompleted,
        progress: Math.min(Math.max(progress || 0, 0), 100),
      },
      create: {
        userId,
        chapterId: params.chapterId,
        isCompleted: !!isCompleted,
        progress: Math.min(Math.max(progress || 0, 0), 100),
      },
    });

    return NextResponse.json(userProgress);
  } catch (error) {
    console.error("[CHAPTER_PROGRESS_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}