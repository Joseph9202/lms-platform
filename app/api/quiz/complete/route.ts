import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { defaultLogger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const { chapterId, userId, score } = await req.json();

    if (!chapterId || !userId || typeof score !== 'number') {
      return new NextResponse('Invalid data', { status: 400 });
    }

    const result = await db.quizResult.upsert({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        },
      },
      update: {
        score,
      },
      create: {
        userId,
        chapterId,
        score,
      },
    });

    defaultLogger.info('Quiz result stored', { userId, chapterId, score });

    return NextResponse.json(result);
  } catch (error: any) {
    defaultLogger.error('[QUIZ_COMPLETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
