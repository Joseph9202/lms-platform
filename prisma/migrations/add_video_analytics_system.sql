-- 🗄️ MIGRACIÓN AVANZADA PARA SISTEMA DE VIDEOS LMS
-- Pacific Labs - LMS Platform
-- Versión: 2.0.0

-- ==========================================
-- EXTENSIONES PARA VIDEOS ADAPTATIVOS
-- ==========================================

-- Agregar columna para URLs de videos adaptativos
ALTER TABLE "Chapter" ADD COLUMN IF NOT EXISTS "adaptiveVideoUrls" TEXT;

-- Agregar metadatos adicionales para videos
ALTER TABLE "Chapter" ADD COLUMN IF NOT EXISTS "videoMetadata" TEXT;
ALTER TABLE "Chapter" ADD COLUMN IF NOT EXISTS "videoDuration" INTEGER;
ALTER TABLE "Chapter" ADD COLUMN IF NOT EXISTS "videoSize" BIGINT;
ALTER TABLE "Chapter" ADD COLUMN IF NOT EXISTS "videoFormat" VARCHAR(10);

-- ==========================================
-- TABLA DE ANALYTICS DE VIDEO
-- ==========================================

CREATE TABLE IF NOT EXISTS "VideoAnalytics" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "chapterId" TEXT NOT NULL,
  "eventType" VARCHAR(50) NOT NULL,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "data" TEXT,
  "sessionId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "VideoAnalytics_chapterId_fkey" 
    FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Índices para optimizar consultas de analytics
CREATE INDEX IF NOT EXISTS "VideoAnalytics_userId_idx" ON "VideoAnalytics"("userId");
CREATE INDEX IF NOT EXISTS "VideoAnalytics_chapterId_idx" ON "VideoAnalytics"("chapterId");
CREATE INDEX IF NOT EXISTS "VideoAnalytics_eventType_idx" ON "VideoAnalytics"("eventType");
CREATE INDEX IF NOT EXISTS "VideoAnalytics_timestamp_idx" ON "VideoAnalytics"("timestamp");
CREATE INDEX IF NOT EXISTS "VideoAnalytics_sessionId_idx" ON "VideoAnalytics"("sessionId");

-- Índice compuesto para consultas comunes
CREATE INDEX IF NOT EXISTS "VideoAnalytics_chapter_event_time_idx" 
  ON "VideoAnalytics"("chapterId", "eventType", "timestamp");

-- ==========================================
-- TABLA DE SESIONES DE VIDEO
-- ==========================================

CREATE TABLE IF NOT EXISTS "VideoSession" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "chapterId" TEXT NOT NULL,
  "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endTime" TIMESTAMP(3),
  "totalWatchTime" INTEGER DEFAULT 0,
  "maxProgress" REAL DEFAULT 0,
  "completed" BOOLEAN DEFAULT false,
  "device" VARCHAR(50),
  "userAgent" TEXT,
  "ipAddress" VARCHAR(45),
  "quality" VARCHAR(10),
  "bandwidth" VARCHAR(20),
  
  CONSTRAINT "VideoSession_chapterId_fkey" 
    FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Índices para sesiones
CREATE INDEX IF NOT EXISTS "VideoSession_userId_idx" ON "VideoSession"("userId");
CREATE INDEX IF NOT EXISTS "VideoSession_chapterId_idx" ON "VideoSession"("chapterId");
CREATE INDEX IF NOT EXISTS "VideoSession_startTime_idx" ON "VideoSession"("startTime");

-- ==========================================
-- TABLA DE RECOMENDACIONES
-- ==========================================

CREATE TABLE IF NOT EXISTS "UserRecommendations" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "recommendations" TEXT NOT NULL,
  "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "basedOnChapterId" TEXT,
  "type" VARCHAR(50) DEFAULT 'automatic',
  "viewed" BOOLEAN DEFAULT false,
  "acted" BOOLEAN DEFAULT false,
  
  CONSTRAINT "UserRecommendations_basedOnChapterId_fkey" 
    FOREIGN KEY ("basedOnChapterId") REFERENCES "Chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Índices para recomendaciones
CREATE INDEX IF NOT EXISTS "UserRecommendations_userId_idx" ON "UserRecommendations"("userId");
CREATE INDEX IF NOT EXISTS "UserRecommendations_generatedAt_idx" ON "UserRecommendations"("generatedAt");

-- ==========================================
-- TABLA DE AUDITORÍA DE VIDEOS
-- ==========================================

CREATE TABLE IF NOT EXISTS "VideoAudit" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "chapterId" TEXT NOT NULL,
  "auditType" VARCHAR(50) NOT NULL,
  "status" VARCHAR(20) NOT NULL,
  "details" TEXT,
  "issues" TEXT,
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "VideoAudit_chapterId_fkey" 
    FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Índices para auditoría
CREATE INDEX IF NOT EXISTS "VideoAudit_chapterId_idx" ON "VideoAudit"("chapterId");
CREATE INDEX IF NOT EXISTS "VideoAudit_auditType_idx" ON "VideoAudit"("auditType");
CREATE INDEX IF NOT EXISTS "VideoAudit_status_idx" ON "VideoAudit"("status");
CREATE INDEX IF NOT EXISTS "VideoAudit_createdAt_idx" ON "VideoAudit"("createdAt");

-- ==========================================
-- TABLA DE CONFIGURACIÓN DEL SISTEMA
-- ==========================================

CREATE TABLE IF NOT EXISTS "SystemConfig" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "key" VARCHAR(100) NOT NULL UNIQUE,
  "value" TEXT NOT NULL,
  "type" VARCHAR(20) NOT NULL DEFAULT 'string',
  "description" TEXT,
  "category" VARCHAR(50) DEFAULT 'general',
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedBy" TEXT
);

-- Configuraciones iniciales del sistema
INSERT INTO "SystemConfig" ("id", "key", "value", "type", "description", "category") VALUES
  ('cfg_video_max_size', 'video.maxFileSize', '524288000', 'number', 'Tamaño máximo de archivo de video en bytes (500MB)', 'video'),
  ('cfg_video_qualities', 'video.supportedQualities', '["480p","720p","1080p"]', 'json', 'Calidades de video soportadas', 'video'),
  ('cfg_analytics_retention', 'analytics.retentionDays', '365', 'number', 'Días de retención de datos de analytics', 'analytics'),
  ('cfg_auto_cleanup', 'storage.autoCleanup', 'true', 'boolean', 'Limpieza automática de archivos temporales', 'storage'),
  ('cfg_adaptive_enabled', 'video.adaptiveEnabled', 'true', 'boolean', 'Habilitar streaming adaptivo', 'video'),
  ('cfg_tracking_interval', 'analytics.trackingInterval', '5000', 'number', 'Intervalo de tracking en milisegundos', 'analytics')
ON CONFLICT ("key") DO NOTHING;

-- ==========================================
-- TABLA DE LOGS DEL SISTEMA
-- ==========================================

CREATE TABLE IF NOT EXISTS "SystemLog" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "level" VARCHAR(10) NOT NULL,
  "message" TEXT NOT NULL,
  "context" TEXT,
  "metadata" TEXT,
  "userId" TEXT,
  "source" VARCHAR(50),
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para logs
CREATE INDEX IF NOT EXISTS "SystemLog_level_idx" ON "SystemLog"("level");
CREATE INDEX IF NOT EXISTS "SystemLog_timestamp_idx" ON "SystemLog"("timestamp");
CREATE INDEX IF NOT EXISTS "SystemLog_source_idx" ON "SystemLog"("source");
CREATE INDEX IF NOT EXISTS "SystemLog_userId_idx" ON "SystemLog"("userId");

-- ==========================================
-- TABLA DE ESTADÍSTICAS AGREGADAS
-- ==========================================

CREATE TABLE IF NOT EXISTS "VideoStatistics" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "chapterId" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "totalViews" INTEGER DEFAULT 0,
  "uniqueViewers" INTEGER DEFAULT 0,
  "totalWatchTime" INTEGER DEFAULT 0,
  "avgCompletionRate" REAL DEFAULT 0,
  "avgEngagementScore" REAL DEFAULT 0,
  "topDropoffPoint" INTEGER DEFAULT 0,
  "qualityBreakdown" TEXT,
  "deviceBreakdown" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "VideoStatistics_chapterId_fkey" 
    FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  
  UNIQUE("chapterId", "date")
);

-- Índices para estadísticas
CREATE INDEX IF NOT EXISTS "VideoStatistics_chapterId_idx" ON "VideoStatistics"("chapterId");
CREATE INDEX IF NOT EXISTS "VideoStatistics_date_idx" ON "VideoStatistics"("date");

-- ==========================================
-- TABLA DE NOTIFICACIONES
-- ==========================================

CREATE TABLE IF NOT EXISTS "SystemNotification" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "type" VARCHAR(50) NOT NULL,
  "title" VARCHAR(200) NOT NULL,
  "message" TEXT NOT NULL,
  "severity" VARCHAR(20) DEFAULT 'info',
  "targetUserId" TEXT,
  "targetRole" VARCHAR(50),
  "relatedEntityId" TEXT,
  "relatedEntityType" VARCHAR(50),
  "read" BOOLEAN DEFAULT false,
  "actionRequired" BOOLEAN DEFAULT false,
  "actionUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "readAt" TIMESTAMP(3)
);

-- Índices para notificaciones
CREATE INDEX IF NOT EXISTS "SystemNotification_targetUserId_idx" ON "SystemNotification"("targetUserId");
CREATE INDEX IF NOT EXISTS "SystemNotification_type_idx" ON "SystemNotification"("type");
CREATE INDEX IF NOT EXISTS "SystemNotification_createdAt_idx" ON "SystemNotification"("createdAt");
CREATE INDEX IF NOT EXISTS "SystemNotification_read_idx" ON "SystemNotification"("read");

-- Fin de la migración
SELECT 'Video Analytics Migration completed successfully!' as result;