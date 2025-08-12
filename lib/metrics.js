// ===========================================
// CUSTOM METRICS - LMS PLATFORM
// Sistema de métricas personalizadas para monitoreo
// ===========================================

const client = require('prom-client');

// Crear registro personalizado para métricas de negocio
const businessMetrics = new client.Registry();

// ===========================================
// MÉTRICAS DE USUARIO
// ===========================================

// Usuarios activos
const activeUsers = new client.Gauge({
  name: 'lms_active_users_total',
  help: 'Total number of active users in the last 24 hours',
  labelNames: ['user_type', 'subscription_tier']
});

// Registraciones de usuarios
const userRegistrations = new client.Counter({
  name: 'lms_user_registrations_total',
  help: 'Total number of user registrations',
  labelNames: ['registration_source', 'user_type']
});

// Intentos de login fallidos
const failedLoginAttempts = new client.Counter({
  name: 'lms_failed_login_attempts_total',
  help: 'Total number of failed login attempts',
  labelNames: ['ip_address', 'user_agent']
});

// Sesiones de usuario
const userSessions = new client.Histogram({
  name: 'lms_user_session_duration_seconds',
  help: 'Duration of user sessions in seconds',
  labelNames: ['user_type', 'device_type'],
  buckets: [60, 300, 900, 1800, 3600, 7200] // 1min, 5min, 15min, 30min, 1h, 2h
});

// ===========================================
// MÉTRICAS DE CURSOS
// ===========================================

// Cursos creados
const coursesCreated = new client.Counter({
  name: 'lms_courses_created_total',
  help: 'Total number of courses created',
  labelNames: ['category', 'instructor_id', 'course_type']
});

// Inscripciones a cursos
const courseEnrollments = new client.Counter({
  name: 'lms_course_enrollments_total',
  help: 'Total number of course enrollments',
  labelNames: ['course_id', 'course_category', 'enrollment_type']
});

// Completaciones de cursos
const courseCompletions = new client.Counter({
  name: 'lms_course_completions_total',
  help: 'Total number of course completions',
  labelNames: ['course_id', 'course_category', 'completion_time_bucket']
});

// Progreso de cursos
const courseProgress = new client.Histogram({
  name: 'lms_course_progress_percentage',
  help: 'Course completion percentage distribution',
  labelNames: ['course_id', 'user_type'],
  buckets: [10, 25, 50, 75, 90, 100]
});

// Rating de cursos
const courseRatings = new client.Histogram({
  name: 'lms_course_ratings',
  help: 'Course ratings distribution',
  labelNames: ['course_id', 'rating_type'],
  buckets: [1, 2, 3, 4, 5]
});

// ===========================================
// MÉTRICAS DE VIDEO
// ===========================================

// Uploads de video
const videoUploads = new client.Counter({
  name: 'lms_video_uploads_total',
  help: 'Total number of video uploads',
  labelNames: ['status', 'file_size_bucket', 'format']
});

// Fallas en uploads de video
const videoUploadFailures = new client.Counter({
  name: 'lms_video_upload_failures_total',
  help: 'Total number of failed video uploads',
  labelNames: ['error_type', 'file_size_bucket']
});

// Tiempo de procesamiento de video
const videoProcessingTime = new client.Histogram({
  name: 'lms_video_processing_duration_seconds',
  help: 'Video processing duration in seconds',
  labelNames: ['video_format', 'resolution', 'duration_bucket'],
  buckets: [30, 60, 180, 300, 600, 1200, 1800] // 30s, 1m, 3m, 5m, 10m, 20m, 30m
});

// Reproducciones de video
const videoViews = new client.Counter({
  name: 'lms_video_views_total',
  help: 'Total number of video views',
  labelNames: ['video_id', 'course_id', 'user_type', 'device_type']
});

// Tiempo de visualización
const videoWatchTime = new client.Histogram({
  name: 'lms_video_watch_duration_seconds',
  help: 'Video watch duration in seconds',
  labelNames: ['video_id', 'completion_rate_bucket'],
  buckets: [30, 60, 300, 600, 1200, 1800, 3600] // Hasta 1 hora
});

// ===========================================
// MÉTRICAS DE PAGOS
// ===========================================

// Intentos de pago
const paymentAttempts = new client.Counter({
  name: 'lms_payment_attempts_total',
  help: 'Total number of payment attempts',
  labelNames: ['payment_method', 'currency', 'amount_bucket']
});

// Pagos exitosos
const successfulPayments = new client.Counter({
  name: 'lms_successful_payments_total',
  help: 'Total number of successful payments',
  labelNames: ['payment_method', 'currency', 'subscription_type']
});

// Fallas en pagos
const paymentFailures = new client.Counter({
  name: 'lms_payment_failures_total',
  help: 'Total number of payment failures',
  labelNames: ['payment_method', 'error_code', 'failure_reason']
});

// Ingresos
const revenue = new client.Counter({
  name: 'lms_revenue_total_cents',
  help: 'Total revenue in cents',
  labelNames: ['currency', 'subscription_type', 'payment_method']
});

// Reembolsos
const refunds = new client.Counter({
  name: 'lms_refunds_total',
  help: 'Total number of refunds',
  labelNames: ['reason', 'amount_bucket', 'currency']
});

// ===========================================
// MÉTRICAS DE SISTEMA
// ===========================================

// Requests HTTP
const httpRequests = new client.Counter({
  name: 'lms_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Duración de requests
const httpRequestDuration = new client.Histogram({
  name: 'lms_http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

// Conexiones de base de datos
const dbConnections = new client.Gauge({
  name: 'lms_database_connections_active',
  help: 'Number of active database connections',
  labelNames: ['database', 'pool_name']
});

// Queries de base de datos
const dbQueries = new client.Counter({
  name: 'lms_database_queries_total',
  help: 'Total number of database queries',
  labelNames: ['operation', 'table', 'status']
});

// Duración de queries
const dbQueryDuration = new client.Histogram({
  name: 'lms_database_query_duration_seconds',
  help: 'Database query duration in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5]
});

// ===========================================
// MÉTRICAS DE CACHÉ
// ===========================================

// Hit rate de caché
const cacheHits = new client.Counter({
  name: 'lms_cache_hits_total',
  help: 'Total number of cache hits',
  labelNames: ['cache_type', 'key_pattern']
});

// Miss rate de caché
const cacheMisses = new client.Counter({
  name: 'lms_cache_misses_total',
  help: 'Total number of cache misses',
  labelNames: ['cache_type', 'key_pattern']
});

// ===========================================
// REGISTRAR MÉTRICAS
// ===========================================

// Registrar todas las métricas en el registro de Prometheus
[
  activeUsers, userRegistrations, failedLoginAttempts, userSessions,
  coursesCreated, courseEnrollments, courseCompletions, courseProgress, courseRatings,
  videoUploads, videoUploadFailures, videoProcessingTime, videoViews, videoWatchTime,
  paymentAttempts, successfulPayments, paymentFailures, revenue, refunds,
  httpRequests, httpRequestDuration, dbConnections, dbQueries, dbQueryDuration,
  cacheHits, cacheMisses
].forEach(metric => {
  client.register.registerMetric(metric);
  businessMetrics.registerMetric(metric);
});

// ===========================================
// FUNCIONES AUXILIARES
// ===========================================

// Función para actualizar métricas de usuario activo
function trackActiveUser(userId, userType = 'student', subscriptionTier = 'free') {
  activeUsers.set({ user_type: userType, subscription_tier: subscriptionTier }, 1);
}

// Función para trackear registro de usuario
function trackUserRegistration(source = 'direct', userType = 'student') {
  userRegistrations.inc({ registration_source: source, user_type: userType });
}

// Función para trackear login fallido
function trackFailedLogin(ipAddress, userAgent) {
  failedLoginAttempts.inc({ ip_address: ipAddress, user_agent: userAgent });
}

// Función para trackear sesión de usuario
function trackUserSession(duration, userType = 'student', deviceType = 'desktop') {
  userSessions.observe({ user_type: userType, device_type: deviceType }, duration);
}

// Función para trackear creación de curso
function trackCourseCreation(category, instructorId, courseType = 'video') {
  coursesCreated.inc({ category, instructor_id: instructorId, course_type: courseType });
}

// Función para trackear inscripción a curso
function trackCourseEnrollment(courseId, category, enrollmentType = 'paid') {
  courseEnrollments.inc({ course_id: courseId, course_category: category, enrollment_type: enrollmentType });
}

// Función para trackear completación de curso
function trackCourseCompletion(courseId, category, completionTime) {
  const timeBucket = getTimeBucket(completionTime);
  courseCompletions.inc({ course_id: courseId, course_category: category, completion_time_bucket: timeBucket });
}

// Función para trackear upload de video
function trackVideoUpload(status, fileSize, format) {
  const sizeBucket = getFileSizeBucket(fileSize);
  videoUploads.inc({ status, file_size_bucket: sizeBucket, format });
}

// Función para trackear falla en upload de video
function trackVideoUploadFailure(errorType, fileSize) {
  const sizeBucket = getFileSizeBucket(fileSize);
  videoUploadFailures.inc({ error_type: errorType, file_size_bucket: sizeBucket });
}

// Función para trackear request HTTP
function trackHttpRequest(method, route, statusCode, duration) {
  httpRequests.inc({ method, route, status_code: statusCode });
  httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);
}

// Función para trackear query de base de datos
function trackDatabaseQuery(operation, table, duration, status = 'success') {
  dbQueries.inc({ operation, table, status });
  dbQueryDuration.observe({ operation, table }, duration);
}

// Función para trackear pago
function trackPayment(method, currency, amount, subscriptionType, success = true) {
  const amountBucket = getAmountBucket(amount);
  
  paymentAttempts.inc({ payment_method: method, currency, amount_bucket: amountBucket });
  
  if (success) {
    successfulPayments.inc({ payment_method: method, currency, subscription_type: subscriptionType });
    revenue.inc({ currency, subscription_type: subscriptionType, payment_method: method }, amount);
  }
}

// ===========================================
// FUNCIONES DE UTILIDAD
// ===========================================

function getTimeBucket(timeInSeconds) {
  if (timeInSeconds < 3600) return 'under_1h';
  if (timeInSeconds < 86400) return '1h_to_1d';
  if (timeInSeconds < 604800) return '1d_to_1w';
  if (timeInSeconds < 2592000) return '1w_to_1m';
  return 'over_1m';
}

function getFileSizeBucket(sizeInBytes) {
  const sizeInMB = sizeInBytes / (1024 * 1024);
  if (sizeInMB < 50) return 'small';
  if (sizeInMB < 200) return 'medium';
  if (sizeInMB < 500) return 'large';
  return 'xlarge';
}

function getAmountBucket(amountInCents) {
  const amount = amountInCents / 100;
  if (amount < 10) return 'under_10';
  if (amount < 50) return '10_to_50';
  if (amount < 100) return '50_to_100';
  if (amount < 500) return '100_to_500';
  return 'over_500';
}

// Middleware para Express.js
function prometheusMiddleware(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    trackHttpRequest(req.method, route, res.statusCode, duration);
  });
  
  next();
}

// ===========================================
// EXPORTS
// ===========================================

module.exports = {
  // Métricas
  activeUsers,
  userRegistrations,
  failedLoginAttempts,
  userSessions,
  coursesCreated,
  courseEnrollments,
  courseCompletions,
  courseProgress,
  courseRatings,
  videoUploads,
  videoUploadFailures,
  videoProcessingTime,
  videoViews,
  videoWatchTime,
  paymentAttempts,
  successfulPayments,
  paymentFailures,
  revenue,
  refunds,
  httpRequests,
  httpRequestDuration,
  dbConnections,
  dbQueries,
  dbQueryDuration,
  cacheHits,
  cacheMisses,
  
  // Funciones de tracking
  trackActiveUser,
  trackUserRegistration,
  trackFailedLogin,
  trackUserSession,
  trackCourseCreation,
  trackCourseEnrollment,
  trackCourseCompletion,
  trackVideoUpload,
  trackVideoUploadFailure,
  trackHttpRequest,
  trackDatabaseQuery,
  trackPayment,
  
  // Middleware
  prometheusMiddleware,
  
  // Registros
  businessMetrics,
  
  // Función para obtener todas las métricas
  getMetrics: () => client.register.metrics(),
  getBusinessMetrics: () => businessMetrics.metrics()
};
