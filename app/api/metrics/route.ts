// ===========================================
// METRICS API ENDPOINT - LMS PLATFORM
// Endpoint para Prometheus metrics
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import client from 'prom-client';

// Importar métricas personalizadas
const {
  trackActiveUser,
  trackHttpRequest,
  getMetrics,
  getBusinessMetrics,
  activeUsers,
  dbConnections,
  httpRequests
} = require('@/lib/metrics');

// Configurar colección de métricas por defecto
client.collectDefaultMetrics({
  prefix: 'lms_',
  timeout: 10000,
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
  eventLoopMonitoringPrecision: 5,
});

// Métricas adicionales de Next.js
const nextjsBuilds = new client.Counter({
  name: 'lms_nextjs_builds_total',
  help: 'Total number of Next.js builds'
});

const nextjsHotReloads = new client.Counter({
  name: 'lms_nextjs_hot_reloads_total',
  help: 'Total number of Next.js hot reloads in development'
});

// Registrar métricas adicionales
client.register.registerMetric(nextjsBuilds);
client.register.registerMetric(nextjsHotReloads);

// ===========================================
// FUNCIÓN PARA ACTUALIZAR MÉTRICAS EN TIEMPO REAL
// ===========================================

async function updateRealTimeMetrics() {
  try {
    // Actualizar métricas de usuarios activos (simulado)
    // En producción, esto vendría de la base de datos o Redis
    const activeUserCount = await getActiveUserCount();
    activeUsers.set({ user_type: 'student', subscription_tier: 'free' }, activeUserCount.free);
    activeUsers.set({ user_type: 'student', subscription_tier: 'premium' }, activeUserCount.premium);
    activeUsers.set({ user_type: 'instructor', subscription_tier: 'professional' }, activeUserCount.instructors);
    
    // Actualizar métricas de conexiones de base de datos
    const dbConnectionCount = await getDatabaseConnectionCount();
    dbConnections.set({ database: 'mysql', pool_name: 'main' }, dbConnectionCount);
    
  } catch (error) {
    console.error('Error updating real-time metrics:', error);
  }
}

// ===========================================
// FUNCIONES AUXILIARES
// ===========================================

async function getActiveUserCount() {
  // En producción, esto vendría de tu base de datos
  // Por ahora retornamos datos simulados
  return {
    free: Math.floor(Math.random() * 1000) + 500,
    premium: Math.floor(Math.random() * 200) + 100,
    instructors: Math.floor(Math.random() * 50) + 25
  };
}

async function getDatabaseConnectionCount() {
  // En producción, esto vendría del pool de conexiones
  return Math.floor(Math.random() * 20) + 5;
}

// ===========================================
// HANDLER PRINCIPAL
// ===========================================

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Obtener parámetros de query
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'prometheus';
    const module = searchParams.get('module') || 'all';
    
    // Actualizar métricas en tiempo real
    await updateRealTimeMetrics();
    
    let metricsData: string;
    
    switch (module) {
      case 'business':
        metricsData = await getBusinessMetrics();
        break;
      case 'system':
        metricsData = await client.register.getSingleMetricAsString('lms_http_requests_total');
        break;
      case 'default':
        metricsData = await client.register.metrics();
        break;
      default:
        // Todas las métricas
        metricsData = await getMetrics();
        break;
    }
    
    // Trackear esta request
    const duration = (Date.now() - startTime) / 1000;
    trackHttpRequest('GET', '/api/metrics', 200, duration);
    
    // Responder según el formato solicitado
    if (format === 'json') {
      // Convertir métricas de Prometheus a JSON para debugging
      const metrics = await client.register.getMetricsAsJSON();
      return NextResponse.json({
        timestamp: new Date().toISOString(),
        module,
        metrics,
        metadata: {
          scrape_duration_seconds: duration,
          metrics_count: metrics.length
        }
      });
    }
    
    // Formato Prometheus por defecto
    return new NextResponse(metricsData, {
      status: 200,
      headers: {
        'Content-Type': client.register.contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Metrics-Module': module,
        'X-Scrape-Duration': duration.toString()
      }
    });
    
  } catch (error) {
    console.error('Error generating metrics:', error);
    
    // Trackear error
    const duration = (Date.now() - startTime) / 1000;
    trackHttpRequest('GET', '/api/metrics', 500, duration);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate metrics',
        timestamp: new Date().toISOString(),
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// ===========================================
// MÉTRICAS ESPECÍFICAS DE DESARROLLO
// ===========================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;
    
    switch (action) {
      case 'hot_reload':
        nextjsHotReloads.inc();
        break;
        
      case 'build_complete':
        nextjsBuilds.inc();
        break;
        
      case 'custom_metric':
        // Permitir métricas personalizadas desde el frontend
        if (data.metricName && data.value) {
          const customMetric = new client.Gauge({
            name: `lms_custom_${data.metricName}`,
            help: data.help || 'Custom metric from frontend',
            labelNames: data.labels || []
          });
          
          if (data.labels && data.labelValues) {
            const labelObj = {};
            data.labels.forEach((label: string, index: number) => {
              labelObj[label] = data.labelValues[index];
            });
            customMetric.set(labelObj, data.value);
          } else {
            customMetric.set(data.value);
          }
        }
        break;
        
      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({ 
      success: true,
      action,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error processing metrics POST:', error);
    return NextResponse.json(
      { error: 'Failed to process metrics action' },
      { status: 500 }
    );
  }
}

// ===========================================
// HEALTH CHECK ESPECÍFICO PARA MÉTRICAS
// ===========================================

export async function HEAD(request: NextRequest) {
  try {
    // Verificar que las métricas estén funcionando
    const metricsCount = client.register.getMetricsAsArray().length;
    
    return new NextResponse(null, {
      status: metricsCount > 0 ? 200 : 503,
      headers: {
        'X-Metrics-Available': metricsCount.toString(),
        'X-Metrics-Status': metricsCount > 0 ? 'healthy' : 'unhealthy'
      }
    });
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}
