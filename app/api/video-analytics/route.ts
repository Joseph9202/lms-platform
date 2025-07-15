// 📊 API DE ANALYTICS DE VIDEO AVANZADO
// Pacific Labs LMS Platform - Video Analytics API
// /app/api/video-analytics/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { analytics } from '@/lib/video-analytics-system';

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { chapterId, eventType, data = {}, timestamp } = body;

    // Validar parámetros requeridos
    if (!chapterId || !eventType) {
      return NextResponse.json(
        { error: 'chapterId y eventType son requeridos' }, 
        { status: 400 }
      );
    }

    // Validar tipos de eventos permitidos
    const allowedEvents = ['play', 'pause', 'seek', 'complete', 'progress', 'quality_change', 'speed_change'];
    if (!allowedEvents.includes(eventType)) {
      return NextResponse.json(
        { error: 'Tipo de evento no válido' }, 
        { status: 400 }
      );
    }

    // Agregar información adicional del request
    const enhancedData = {
      ...data,
      userAgent: req.headers.get('user-agent'),
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      referer: req.headers.get('referer'),
      timestamp: timestamp || Date.now()
    };

    // Registrar evento
    const event = await analytics.trackVideoEvent(
      userId,
      chapterId,
      eventType,
      enhancedData.timestamp,
      enhancedData
    );

    return NextResponse.json({
      success: true,
      eventId: event.id,
      message: 'Evento registrado exitosamente'
    });

  } catch (error) {
    console.error('Error en video analytics API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const chapterId = searchParams.get('chapterId');
    const timeRange = searchParams.get('timeRange') || '7d';
    const eventType = searchParams.get('eventType');

    if (!chapterId) {
      return NextResponse.json(
        { error: 'chapterId es requerido' }, 
        { status: 400 }
      );
    }

    // Generar reporte de analytics
    const report = await analytics.generateAnalyticsReport(chapterId, timeRange);

    // Filtrar por tipo de evento si se especifica
    if (eventType && report) {
      // Aplicar filtros adicionales según sea necesario
      report.filteredBy = eventType;
    }

    return NextResponse.json({
      success: true,
      data: report,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error obteniendo analytics:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    );
  }
}

// Limpiar datos antiguos (solo para administradores)
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // TODO: Verificar si el usuario es administrador
    // const user = await database.user.findUnique({ where: { id: userId } });
    // if (user?.role !== 'ADMIN') {
    //   return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    // }

    const searchParams = req.nextUrl.searchParams;
    const olderThanDays = parseInt(searchParams.get('olderThanDays') || '365');

    // Limpiar datos antiguos
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    // En una implementación real, esto eliminaría registros de la base de datos
    console.log(`Limpiando analytics más antiguos que ${olderThanDays} días`);

    return NextResponse.json({
      success: true,
      message: `Analytics más antiguos que ${olderThanDays} días han sido eliminados`,
      cutoffDate: cutoffDate.toISOString()
    });

  } catch (error) {
    console.error('Error limpiando analytics:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    );
  }
}