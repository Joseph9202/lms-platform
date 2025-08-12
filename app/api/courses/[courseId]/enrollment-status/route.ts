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

    const purchase = await db.purchase.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: params.courseId,
        }
      }
    });

    return NextResponse.json({ 
      purchased: !!purchase,
      purchaseId: purchase?.id || null 
    });
  } catch (error) {
    console.log("[ENROLLMENT_STATUS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}