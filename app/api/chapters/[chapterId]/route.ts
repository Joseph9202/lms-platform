import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { db } from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: { chapterId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { chapterId } = params;
    const { isCompleted, progress } = await req.json();

    // Verificar que el capítulo existe
    const chapter = await db.chapter.findUnique({
      where: {
        id: chapterId,
      },
      include: {
        course: true,
      },
    });

    if (!chapter) {
      return new NextResponse('Chapter not found', { status: 404 });
    }

    // Actualizar o crear progreso del usuario
    const userProgress = await db.userProgress.upsert({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        },
      },
      update: {
        isCompleted: !!isCompleted,
      },
      create: {
        userId,
        chapterId,
        isCompleted: !!isCompleted,
      },
    });

    return NextResponse.json(userProgress);
  } catch (error) {
    console.error('[CHAPTER_PROGRESS_UPDATE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { chapterId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { chapterId } = params;

    const userProgress = await db.userProgress.findUnique({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        },
      },
    });

    return NextResponse.json({
      isCompleted: userProgress?.isCompleted || false,
      progress: userProgress?.isCompleted ? 100 : 0,
    });
  } catch (error) {
    console.error('[CHAPTER_PROGRESS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}