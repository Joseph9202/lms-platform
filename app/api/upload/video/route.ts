import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { uploadVideo } from '@/lib/google-cloud/storage';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('video') as File;
    const chapterId = formData.get('chapterId') as string;

    if (!file) {
      return new NextResponse('No video file provided', { status: 400 });
    }

    if (!chapterId) {
      return new NextResponse('Chapter ID is required', { status: 400 });
    }

    // Verificar que el usuario es dueño del curso
    const chapter = await db.chapter.findUnique({
      where: {
        id: chapterId,
      },
      include: {
        course: true,
      },
    });

    if (!chapter || chapter.course.userId !== userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('video/')) {
      return new NextResponse('File must be a video', { status: 400 });
    }

    // Validar tamaño (máximo 500MB)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      return new NextResponse('File size too large (max 500MB)', { status: 400 });
    }

    // Convertir archivo a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const fileName = `${chapterId}-${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // Subir video a Google Cloud Storage
    const videoUrl = await uploadVideo(buffer, fileName);

    // Actualizar capítulo con la URL del video
    const updatedChapter = await db.chapter.update({
      where: {
        id: chapterId,
      },
      data: {
        videoUrl: videoUrl,
      },
    });

    return NextResponse.json({
      success: true,
      videoUrl: videoUrl,
      chapter: updatedChapter,
    });

  } catch (error) {
    console.error('[VIDEO_UPLOAD]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}