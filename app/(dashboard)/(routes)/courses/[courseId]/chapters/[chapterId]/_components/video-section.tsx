import { db } from "@/lib/db";
import { VideoSectionClient } from "./video-section-client";

interface VideoSectionProps {
  chapterId: string;
  chapterTitle: string;
  userId: string;
  isOwner: boolean;
}

export const VideoSection = async ({ chapterId, chapterTitle, userId, isOwner }: VideoSectionProps) => {
  // Get chapter data with video URL
  const chapter = await db.chapter.findUnique({
    where: {
      id: chapterId
    },
    select: {
      videoUrl: true,
      title: true,
      description: true
    }
  });

  const videoUrl = chapter?.videoUrl || "";

  return (
    <VideoSectionClient
      chapterId={chapterId}
      chapterTitle={chapterTitle}
      userId={userId}
      isOwner={isOwner}
      initialVideoUrl={videoUrl}
      description={chapter?.description || ""}
    />
  );
};