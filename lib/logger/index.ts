// ===========================================
// CENTRALIZED LOGGING SYSTEM
// ===========================================
// Sistema de logging para containerización

import winston from 'winston';
import { Request, Response, NextFunction } from 'express';

// Tipos de logs
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  HTTP = 'http',
  DEBUG = 'debug'
}

// Interfaces
interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  userAgent?: string;
  ip?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  responseTime?: number;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

interface ContainerInfo {
  containerId: string;
  hostname: string;
  nodeEnv: string;
  version: string;
  service: string;
}

// Configuración base
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// Información del container
const containerInfo: ContainerInfo = {
  containerId: process.env.HOSTNAME || 'unknown',
  hostname: process.env.HOSTNAME || 'localhost',
  nodeEnv: process.env.NODE_ENV || 'development',
  version: process.env.npm_package_version || '1.0.0',
  service: 'lms-platform'
};

// Formatos personalizados
const jsonFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf((info) => {
    const log = {
      timestamp: info.timestamp,
      level: info.level,
      message: info.message,
      service: containerInfo.service,
      container: containerInfo.containerId,
      hostname: containerInfo.hostname,
      environment: containerInfo.nodeEnv,
      version: containerInfo.version,
      ...info.context,
      ...(info.stack && { stack: info.stack }),
      ...(info.metadata && { metadata: info.metadata })
    };
    
    return JSON.stringify(log);
  })
);

const consoleFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'HH:mm:ss.SSS'
  }),
  winston.format.errors({ stack: true }),
  winston.format.colorize(),
  winston.format.printf((info) => {
    const { timestamp, level, message, context = {}, stack } = info;
    const contextStr = Object.keys(context).length > 0 
      ? ` [${JSON.stringify(context)}]` 
      : '';
    
    let logStr = `${timestamp} [${level}]: ${message}${contextStr}`;
    
    if (stack) {
      logStr += `\n${stack}`;
    }
    
    return logStr;
  })
);

// Transportes
const transports: winston.transport[] = [];

// Console transport (siempre activo)
transports.push(
  new winston.transports.Console({
    level: isDevelopment ? 'debug' : 'info',
    format: isDevelopment ? consoleFormat : jsonFormat,
    handleExceptions: true,
    handleRejections: true
  })
);

// File transports (solo en producción o cuando se especifica)
if (isProduction || process.env.ENABLE_FILE_LOGGING === 'true') {
  // Logs de aplicación
  transports.push(
    new winston.transports.File({
      filename: 'logs/app.log',
      level: 'info',
      format: jsonFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true
    })
  );
  
  // Logs de errores
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: jsonFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true
    })
  );
  
  // Logs de HTTP
  transports.push(
    new winston.transports.File({
      filename: 'logs/http.log',
      level: 'http',
      format: jsonFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 3,
      tailable: true
    })
  );
}

// Logger principal
const logger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: jsonFormat,
  defaultMeta: {
    service: containerInfo.service,
    container: containerInfo.containerId,
    hostname: containerInfo.hostname,
    environment: containerInfo.nodeEnv,
    version: containerInfo.version
  },
  transports,
  exitOnError: false
});

// Clase Logger mejorada
export class Logger {
  private logger: winston.Logger;
  private context: LogContext;

  constructor(defaultContext: Partial<LogContext> = {}) {
    this.logger = logger;
    this.context = defaultContext;
  }

  // Método para agregar contexto
  withContext(context: Partial<LogContext>): Logger {
    return new Logger({ ...this.context, ...context });
  }

  // Métodos de logging
  error(message: string, error?: Error, metadata?: Record<string, any>): void {
    this.logger.error(message, {
      context: this.context,
      metadata,
      ...(error && { 
        stack: error.stack,
        errorName: error.name,
        errorMessage: error.message 
      })
    });
  }

  warn(message: string, metadata?: Record<string, any>): void {
    this.logger.warn(message, {
      context: this.context,
      metadata
    });
  }

  info(message: string, metadata?: Record<string, any>): void {
    this.logger.info(message, {
      context: this.context,
      metadata
    });
  }

  http(message: string, metadata?: Record<string, any>): void {
    this.logger.http(message, {
      context: this.context,
      metadata
    });
  }

  debug(message: string, metadata?: Record<string, any>): void {
    this.logger.debug(message, {
      context: this.context,
      metadata
    });
  }

  // Métodos especializados
  logAuth(action: string, userId?: string, success: boolean = true, metadata?: Record<string, any>): void {
    this.withContext({ component: 'auth', action, userId }).info(
      `Authentication ${action}: ${success ? 'SUCCESS' : 'FAILED'}`,
      metadata
    );
  }

  logDatabase(operation: string, table: string, duration: number, success: boolean = true, metadata?: Record<string, any>): void {
    this.withContext({ component: 'database', action: operation }).info(
      `Database ${operation} on ${table}: ${success ? 'SUCCESS' : 'FAILED'} (${duration}ms)`,
      { duration, table, ...metadata }
    );
  }

  logPayment(action: string, amount?: number, currency?: string, success: boolean = true, metadata?: Record<string, any>): void {
    this.withContext({ component: 'payment', action }).info(
      `Payment ${action}: ${success ? 'SUCCESS' : 'FAILED'}`,
      { amount, currency, ...metadata }
    );
  }

  logVideo(action: string, videoId?: string, duration?: number, success: boolean = true, metadata?: Record<string, any>): void {
    this.withContext({ component: 'video', action }).info(
      `Video ${action}: ${success ? 'SUCCESS' : 'FAILED'}`,
      { videoId, duration, ...metadata }
    );
  }

  logCourse(action: string, courseId?: string, userId?: string, success: boolean = true, metadata?: Record<string, any>): void {
    this.withContext({ component: 'course', action, userId }).info(
      `Course ${action}: ${success ? 'SUCCESS' : 'FAILED'}`,
      { courseId, ...metadata }
    );
  }

  logSecurity(event: string, severity: 'low' | 'medium' | 'high' | 'critical', metadata?: Record<string, any>): void {
    const logMethod = severity === 'critical' || severity === 'high' ? 'error' : 'warn';
    
    this.withContext({ component: 'security', action: event })[logMethod](
      `Security Event: ${event} (${severity.toUpperCase()})`,
      { severity, ...metadata }
    );
  }

  logPerformance(operation: string, duration: number, threshold: number = 1000, metadata?: Record<string, any>): void {
    const isSlowOperation = duration > threshold;
    const logMethod = isSlowOperation ? 'warn' : 'info';
    
    this.withContext({ component: 'performance', action: operation })[logMethod](
      `Performance: ${operation} completed in ${duration}ms${isSlowOperation ? ' (SLOW)' : ''}`,
      { duration, threshold, isSlow: isSlowOperation, ...metadata }
    );
  }
}

// Middleware de logging para Express
export function requestLoggingMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  // Agregar requestId al request
  (req as any).requestId = requestId;
  
  const requestLogger = new Logger({
    requestId,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress
  });

  // Log de inicio de request
  requestLogger.http(`${req.method} ${req.url} - START`, {
    headers: req.headers,
    query: req.query,
    body: req.method !== 'GET' ? req.body : undefined
  });

  // Override del res.end para capturar el final del request
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const duration = Date.now() - startTime;
    
    requestLogger.http(`${req.method} ${req.url} - END`, {
      statusCode: res.statusCode,
      duration,
      contentLength: res.get('content-length')
    });

    // Log de performance si es lento
    if (duration > 1000) {
      requestLogger.logPerformance(`${req.method} ${req.url}`, duration, 1000);
    }

    originalEnd.call(this, chunk, encoding);
  };

  // Agregar logger al request para uso posterior
  (req as any).logger = requestLogger;

  next();
}

// Middleware de error logging
export function errorLoggingMiddleware(error: Error, req: Request, res: Response, next: NextFunction): void {
  const requestLogger = (req as any).logger || new Logger();
  
  requestLogger.error(`Error in ${req.method} ${req.url}`, error, {
    statusCode: res.statusCode,
    requestBody: req.body,
    requestQuery: req.query,
    requestHeaders: req.headers
  });

  next(error);
}

// Función para logs estructurados de Kubernetes
export function logKubernetesEvent(event: string, level: LogLevel = LogLevel.INFO, metadata?: Record<string, any>): void {
  const k8sLogger = new Logger({ component: 'kubernetes' });
  
  k8sLogger[level](`K8s Event: ${event}`, {
    ...metadata,
    node: process.env.NODE_NAME,
    pod: process.env.HOSTNAME,
    namespace: process.env.NAMESPACE || 'lms-platform'
  });
}

// Función para logs de health check
export function logHealthCheck(endpoint: string, status: 'healthy' | 'unhealthy' | 'degraded', responseTime: number, details?: Record<string, any>): void {
  const healthLogger = new Logger({ component: 'health' });
  
  const logMethod = status === 'healthy' ? 'info' : status === 'degraded' ? 'warn' : 'error';
  
  healthLogger[logMethod](`Health Check: ${endpoint} - ${status.toUpperCase()}`, {
    endpoint,
    status,
    responseTime,
    ...details
  });
}

// Función para logs de métricas
export function logMetrics(metricName: string, value: number, labels?: Record<string, string>, metadata?: Record<string, any>): void {
  const metricsLogger = new Logger({ component: 'metrics' });
  
  metricsLogger.info(`Metric: ${metricName}`, {
    metricName,
    value,
    labels,
    ...metadata
  });
}

// Logger por defecto
export const defaultLogger = new Logger();

// Exportar instancia de winston para casos especiales
export { logger as winstonLogger };

// Configurar manejo de excepciones no capturadas
if (isProduction) {
  process.on('uncaughtException', (error: Error) => {
    defaultLogger.error('Uncaught Exception', error, {
      process: 'uncaughtException',
      fatal: true
    });
    
    // Dar tiempo para que se escriba el log antes de salir
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });

  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    defaultLogger.error('Unhandled Rejection', new Error(reason), {
      process: 'unhandledRejection',
      promise: promise.toString(),
      fatal: false
    });
  });
}

// Exportar todo
export default Logger;
