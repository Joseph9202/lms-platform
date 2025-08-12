// ===========================================
// ADVANCED HEALTH CHECK - LMS PLATFORM
// Endpoint completo de verificación de salud del sistema
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Configuración de timeouts
const HEALTH_CHECK_TIMEOUT = 5000; // 5 segundos
const DATABASE_TIMEOUT = 3000; // 3 segundos
const REDIS_TIMEOUT = 2000; // 2 segundos
const EXTERNAL_SERVICE_TIMEOUT = 4000; // 4 segundos

// Estado de la aplicación
interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    [key: string]: {
      status: 'up' | 'down' | 'degraded';
      responseTime?: number;
      message?: string;
      details?: any;
    };
  };
  metrics?: {
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      loadAverage: number[];
    };
    process: {
      pid: number;
      uptime: number;
    };
  };
}

// Cache de estado para evitar verificaciones excesivas
let lastHealthCheck: HealthStatus | null = null;
let lastCheckTime = 0;
const CACHE_DURATION = 30000; // 30 segundos

// ===========================================
// FUNCIONES DE VERIFICACIÓN
// ===========================================

async function checkDatabase(): Promise<{ status: 'up' | 'down'; responseTime: number; message?: string }> {
  const startTime = Date.now();
  
  try {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });

    // Timeout wrapper
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database timeout')), DATABASE_TIMEOUT);
    });

    // Query simple para verificar conectividad
    const healthCheckPromise = prisma.$queryRaw`SELECT 1 as health`;

    await Promise.race([healthCheckPromise, timeoutPromise]);
    await prisma.$disconnect();

    const responseTime = Date.now() - startTime;
    
    return {
      status: 'up',
      responseTime,
      message: 'Database connection successful'
    };

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'down',
      responseTime,
      message: error instanceof Error ? error.message : 'Unknown database error'
    };
  }
}

async function checkRedis(): Promise<{ status: 'up' | 'down'; responseTime: number; message?: string }> {
  const startTime = Date.now();
  
  try {
    if (!process.env.REDIS_URL) {
      return {
        status: 'down',
        responseTime: 0,
        message: 'Redis URL not configured'
      };
    }

    // Simulamos verificación de Redis
    // En producción, usarías el cliente real de Redis
    const { createClient } = require('redis');
    const client = createClient({
      url: process.env.REDIS_URL,
      socket: {
        connectTimeout: REDIS_TIMEOUT,
        commandTimeout: REDIS_TIMEOUT
      }
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Redis timeout')), REDIS_TIMEOUT);
    });

    const connectPromise = (async () => {
      await client.connect();
      await client.ping();
      await client.disconnect();
    })();

    await Promise.race([connectPromise, timeoutPromise]);

    const responseTime = Date.now() - startTime;
    
    return {
      status: 'up',
      responseTime,
      message: 'Redis connection successful'
    };

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'down',
      responseTime,
      message: error instanceof Error ? error.message : 'Redis connection failed'
    };
  }
}

async function checkExternalServices(): Promise<{ [key: string]: { status: 'up' | 'down'; responseTime: number; message?: string } }> {
  const services = {
    clerk: 'https://api.clerk.dev/v1/health',
    stripe: 'https://api.stripe.com/healthcheck',
    uploadthing: 'https://uploadthing.com/api/health'
  };

  const results: { [key: string]: { status: 'up' | 'down'; responseTime: number; message?: string } } = {};

  // Verificar servicios en paralelo
  await Promise.allSettled(
    Object.entries(services).map(async ([serviceName, url]) => {
      const startTime = Date.now();
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), EXTERNAL_SERVICE_TIMEOUT);

        const response = await fetch(url, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'User-Agent': 'LMS-Platform-HealthCheck/1.0'
          }
        });

        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;

        results[serviceName] = {
          status: response.ok ? 'up' : 'down',
          responseTime,
          message: response.ok ? 'Service reachable' : `HTTP ${response.status}`
        };

      } catch (error) {
        const responseTime = Date.now() - startTime;
        
        results[serviceName] = {
          status: 'down',
          responseTime,
          message: error instanceof Error ? error.message : 'Service unreachable'
        };
      }
    })
  );

  return results;
}

function getSystemMetrics() {
  try {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    return {
      memory: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
      },
      cpu: {
        loadAverage: require('os').loadavg()
      },
      process: {
        pid: process.pid,
        uptime: process.uptime()
      }
    };
  } catch (error) {
    return {
      memory: { used: 0, total: 0, percentage: 0 },
      cpu: { loadAverage: [0, 0, 0] },
      process: { pid: process.pid, uptime: process.uptime() }
    };
  }
}

function determineOverallStatus(checks: HealthStatus['checks']): 'healthy' | 'degraded' | 'unhealthy' {
  const statuses = Object.values(checks).map(check => check.status);
  
  // Si algún servicio crítico está down, el sistema está unhealthy
  const criticalServices = ['database', 'application'];
  const criticalDown = criticalServices.some(service => 
    checks[service] && checks[service].status === 'down'
  );
  
  if (criticalDown) {
    return 'unhealthy';
  }
  
  // Si algún servicio está down o degraded, el sistema está degraded
  const hasIssues = statuses.includes('down') || statuses.includes('degraded');
  
  if (hasIssues) {
    return 'degraded';
  }
  
  return 'healthy';
}

// ===========================================
// ENDPOINT PRINCIPAL
// ===========================================

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Verificar si podemos usar cache
    const now = Date.now();
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';
    const format = searchParams.get('format') || 'json';
    const includeMetrics = searchParams.get('metrics') !== 'false';
    
    if (!forceRefresh && lastHealthCheck && (now - lastCheckTime) < CACHE_DURATION) {
      const cachedResponse = {
        ...lastHealthCheck,
        cached: true,
        cacheAge: Math.round((now - lastCheckTime) / 1000)
      };
      
      return handleResponse(cachedResponse, format);
    }

    // Realizar verificaciones de salud
    const checks: HealthStatus['checks'] = {};

    // Verificación básica de aplicación
    checks.application = {
      status: 'up',
      responseTime: Date.now() - startTime,
      message: 'Application is running'
    };

    // Verificar base de datos
    try {
      const dbResult = await checkDatabase();
      checks.database = dbResult;
    } catch (error) {
      checks.database = {
        status: 'down',
        message: 'Database check failed'
      };
    }

    // Verificar Redis (si está configurado)
    if (process.env.REDIS_URL) {
      try {
        const redisResult = await checkRedis();
        checks.redis = redisResult;
      } catch (error) {
        checks.redis = {
          status: 'down',
          message: 'Redis check failed'
        };
      }
    }

    // Verificar servicios externos (opcional en health check)
    if (searchParams.get('external') === 'true') {
      try {
        const externalResults = await checkExternalServices();
        Object.assign(checks, externalResults);
      } catch (error) {
        // Los servicios externos no son críticos para el health check básico
      }
    }

    // Construir respuesta de salud
    const healthStatus: HealthStatus = {
      status: determineOverallStatus(checks),
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'unknown',
      checks
    };

    // Agregar métricas del sistema si se solicita
    if (includeMetrics) {
      healthStatus.metrics = getSystemMetrics();
    }

    // Cachear resultado
    lastHealthCheck = healthStatus;
    lastCheckTime = now;

    return handleResponse(healthStatus, format);

  } catch (error) {
    const errorStatus: HealthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'unknown',
      checks: {
        application: {
          status: 'down',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    };

    return handleResponse(errorStatus, 'json', 503);
  }
}

function handleResponse(healthStatus: HealthStatus, format: string, statusCode?: number) {
  const httpStatus = statusCode || (healthStatus.status === 'healthy' ? 200 : 
                                   healthStatus.status === 'degraded' ? 200 : 503);

  // Formato de texto simple para health checks básicos
  if (format === 'text') {
    const text = healthStatus.status === 'healthy' ? 'OK' : 
                 healthStatus.status === 'degraded' ? 'DEGRADED' : 'UNHEALTHY';
    
    return new NextResponse(text, {
      status: httpStatus,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }

  // Formato Prometheus para scraping
  if (format === 'prometheus') {
    const metrics = Object.entries(healthStatus.checks)
      .map(([service, check]) => {
        const status = check.status === 'up' ? 1 : 0;
        const responseTime = check.responseTime || 0;
        
        return [
          `lms_health_check{service="${service}"} ${status}`,
          `lms_health_check_response_time{service="${service}"} ${responseTime}`
        ].join('\n');
      })
      .join('\n');

    return new NextResponse(metrics, {
      status: httpStatus,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }

  // Formato JSON por defecto
  return NextResponse.json(healthStatus, {
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Health-Status': healthStatus.status,
      'X-Health-Timestamp': healthStatus.timestamp
    }
  });
}

// ===========================================
// HEALTH CHECK ESPECÍFICOS
// ===========================================

// Liveness probe - ¿La aplicación está viva?
export async function HEAD(request: NextRequest) {
  try {
    const isAlive = process.uptime() > 0;
    
    return new NextResponse(null, {
      status: isAlive ? 200 : 503,
      headers: {
        'X-Health-Check': 'liveness',
        'X-Uptime': process.uptime().toString()
      }
    });
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}

// Readiness probe - ¿La aplicación está lista para recibir tráfico?
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const checkType = body.type || 'readiness';
    
    if (checkType === 'readiness') {
      // Verificaciones mínimas para readiness
      const dbCheck = await checkDatabase();
      
      const isReady = dbCheck.status === 'up';
      
      return NextResponse.json({
        ready: isReady,
        checks: {
          database: dbCheck
        },
        timestamp: new Date().toISOString()
      }, {
        status: isReady ? 200 : 503,
        headers: {
          'X-Health-Check': 'readiness'
        }
      });
    }
    
    return NextResponse.json(
      { error: 'Unknown check type' },
      { status: 400 }
    );
    
  } catch (error) {
    return NextResponse.json(
      { 
        ready: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}
