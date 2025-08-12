-- 📝 MIGRACIÓN PARA RESULTADOS DE QUIZ
-- Crea la tabla QuizResult relacionada con usuarios y capítulos

CREATE TABLE IF NOT EXISTS "QuizResult" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "chapterId" TEXT NOT NULL,
  "score" INT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "QuizResult_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "QuizResult_userId_chapterId_key" ON "QuizResult"("userId", "chapterId");
CREATE INDEX IF NOT EXISTS "QuizResult_userId_idx" ON "QuizResult"("userId");
CREATE INDEX IF NOT EXISTS "QuizResult_chapterId_idx" ON "QuizResult"("chapterId");
