import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { ChapterWrapper } from "./_components/chapter-wrapper";
import { VideoSection } from "./_components/video-section";
import { ReadingSection } from "./_components/reading-section";
import { LabSection } from "./_components/lab-section";
import { QuizSection } from "./_components/quiz-section";

interface ChapterPageProps {
  params: {
    courseId: string;
    chapterId: string;
  };
}

const ChapterPage = async ({ params }: ChapterPageProps) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  // Get chapter data
  const chapter = await db.chapter.findUnique({
    where: {
      id: params.chapterId,
      courseId: params.courseId,
    },
    include: {
      course: {
        select: {
          title: true,
          price: true,
          userId: true,
        }
      }
    }
  });

  // Get all course chapters for sidebar
  const course = await db.course.findUnique({
    where: {
      id: params.courseId,
    },
    include: {
      chapters: {
        where: {
          isPublished: true,
        },
        orderBy: {
          position: "asc"
        }
      }
    }
  });

  if (!chapter) {
    return redirect("/");
  }

  // Check if user purchased the course
  const purchase = await db.purchase.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: params.courseId,
      }
    }
  });

  // Check if this is the IA Básico course (free for all users)
  const isIABasicoFree = chapter.course.title.toLowerCase().includes('ia básico') || 
                         chapter.course.title.toLowerCase().includes('inteligencia artificial básico');

  // Check if chapter is free or user has purchased or it's IA Básico
  const hasAccess = chapter.isFree || !!purchase || isIABasicoFree;

  if (!hasAccess) {
    return redirect(`/courses/${params.courseId}`);
  }


  // Determine chapter type
  const getChapterType = (title: string) => {
    if (title.startsWith('Sección')) return 'section';
    if (title.includes('Video') || title.includes('🎥')) return 'video';
    if (title.includes('Lectura') || title.includes('📖')) return 'reading';
    if (title.includes('Laboratorio') || title.includes('🧪')) return 'lab';
    if (title.includes('Quiz') || title.includes('📝')) return 'quiz';
    return 'video';
  };

  const chapterType = getChapterType(chapter.title);

  const renderChapterContent = () => {
    switch (chapterType) {
      case 'video':
        return (
          <VideoSection
            chapterId={chapter.id}
            chapterTitle={chapter.title}
            userId={userId}
            isOwner={userId === chapter.course?.userId}
          />
        );
      case 'reading':
        return (
          <ReadingSection
            chapterId={chapter.id}
            chapterTitle={chapter.title}
            userId={userId}
          />
        );
      case 'lab':
        return (
          <LabSection
            chapterId={chapter.id}
            chapterTitle={chapter.title}
            userId={userId}
          />
        );
      case 'quiz':
        return (
          <QuizSection
            chapterId={chapter.id}
            chapterTitle={chapter.title}
            userId={userId}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ChapterWrapper 
      chapter={chapter}
      course={course}
      params={params}
      userId={userId}
    >
      {renderChapterContent()}
    </ChapterWrapper>
  );
};

export default ChapterPage;