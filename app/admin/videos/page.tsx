"use client";

// 🎛️ PÁGINA DE ADMINISTRACIÓN AVANZADA DE VIDEOS
// Pacific Labs LMS Platform - Admin Dashboard
// /app/admin/videos/page.tsx

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  HardDrive, 
  Activity, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  RefreshCw,
  Download,
  Upload,
  Zap,
  Shield,
  Clock,
  Users,
  Eye,
  PlayCircle,
  Trash2,
  Cog,
  FileVideo,
  Database,
  Cloud,
  Cpu,
  ChevronRight,
  Plus,
  Filter,
  Search
} from 'lucide-react';

import { VideoAdminPanel } from '@/components/video-advanced-components';
import { 
  useStorageManagement, 
  useVideoAudit, 
  useAdaptiveMigration 
} from '@/hooks/use-video-advanced';

interface DashboardStats {
  totalVideos: number;
  totalStorage: string;
  monthlyCost: string;
  healthScore: number;
  activeUsers: number;
  todayViews: number;
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  action?: string;
}

const VideoAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { storageInfo, analyzeStorage } = useStorageManagement();
  const { auditResults, runAudit } = useVideoAudit();
  const { migrationStatus, startMigration } = useAdaptiveMigration();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Simular carga de datos del dashboard
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDashboardStats({
        totalVideos: 156,
        totalStorage: '15.7 GB',
        monthlyCost: '$0.31',
        healthScore: 98,
        activeUsers: 1247,
        todayViews: 3456
      });

      setSystemAlerts([
        {
          id: '1',
          type: 'warning',
          title: 'Almacenamiento creciendo rápidamente',
          message: 'El uso de almacenamiento ha aumentado 15% este mes',
          timestamp: '2025-07-13T10:30:00Z',
          action: 'Revisar y limpiar archivos antiguos'
        },
        {
          id: '2',
          type: 'info',
          title: 'Migración adaptiva disponible',
          message: '23 videos pueden migrar a calidad adaptiva',
          timestamp: '2025-07-13T09:15:00Z',
          action: 'Iniciar migración'
        }
      ]);

    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleQuickAction = async (action: string) => {
    try {
      switch (action) {
        case 'analyze-storage':
          await analyzeStorage();
          break;
        case 'run-audit':
          await runAudit();
          break;
        case 'start-migration':
          await startMigration();
          break;
        default:
          console.log(`Acción ${action} ejecutada`);
      }
    } catch (error) {
      console.error(`Error ejecutando ${action}:`, error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: BarChart3 },
    { id: 'storage', label: 'Almacenamiento', icon: HardDrive },
    { id: 'analytics', label: 'Analytics', icon: Activity },
    { id: 'optimization', label: 'Optimización', icon: Zap },
    { id: 'security', label: 'Auditoría', icon: Shield },
    { id: 'settings', label: 'Configuración', icon: Settings }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                🎬 Administración de Videos
              </h1>
              <p className="text-sm text-gray-600">
                Pacific Labs LMS Platform - Sistema Avanzado
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
              
              <div className="flex items-center text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                Sistema Operativo
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      {dashboardStats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <FileVideo className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Videos</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalVideos}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <HardDrive className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Almacenamiento</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalStorage}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Costo Mensual</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.monthlyCost}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-emerald-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Salud del Sistema</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.healthScore}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.activeUsers.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Vistas Hoy</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.todayViews.toLocaleString()}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* System Alerts */}
      {systemAlerts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Alertas del Sistema</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {systemAlerts.map((alert) => (
                <div key={alert.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    {alert.type === 'error' && <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />}
                    {alert.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3" />}
                    {alert.type === 'info' && <CheckCircle className="h-5 w-5 text-blue-500 mr-3" />}
                    
                    <div>
                      <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                      <p className="text-sm text-gray-600">{alert.message}</p>
                      {alert.action && (
                        <p className="text-sm text-blue-600 mt-1">{alert.action}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex space-x-8">
          
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow">
              <nav className="p-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-left rounded-md transition-colors mb-1 ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="h-5 w-5 mr-3" />
                    {tab.label}
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </button>
                ))}
              </nav>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow mt-6">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Acciones Rápidas</h3>
              </div>
              <div className="p-4 space-y-2">
                <button
                  onClick={() => handleQuickAction('analyze-storage')}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analizar Almacenamiento
                </button>
                
                <button
                  onClick={() => handleQuickAction('run-audit')}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Ejecutar Auditoría
                </button>
                
                <button
                  onClick={() => handleQuickAction('start-migration')}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Migrar a Adaptivo
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'storage' && <StorageTab />}
            {activeTab === 'analytics' && <AnalyticsTab />}
            {activeTab === 'optimization' && <OptimizationTab />}
            {activeTab === 'security' && <SecurityTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </div>
        </div>
      </div>
    </div>
  );
};

// 📊 COMPONENTES DE PESTAÑAS
const OverviewTab = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium mb-4">Resumen del Sistema</h3>
      <p className="text-gray-600 mb-4">
        Panel de control principal para el sistema de gestión de videos de Pacific Labs LMS.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">🎥 Gestión de Videos</h4>
          <p className="text-sm text-gray-600 mb-3">
            Sistema completo de subida, procesamiento y distribución de videos educativos.
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>✅ Calidad adaptiva automática</li>
            <li>✅ Analytics en tiempo real</li>
            <li>✅ Almacenamiento optimizado</li>
          </ul>
        </div>
        
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">☁️ Google Cloud Storage</h4>
          <p className="text-sm text-gray-600 mb-3">
            Infraestructura escalable y confiable para almacenamiento de videos.
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>✅ 99.9% disponibilidad</li>
            <li>✅ CDN global integrado</li>
            <li>✅ Costos optimizados</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

const StorageTab = () => (
  <div className="space-y-6">
    <VideoAdminPanel />
  </div>
);

const AnalyticsTab = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium mb-4">Analytics Avanzados</h3>
      <p className="text-gray-600">
        Próximamente: Dashboard completo de analytics con métricas detalladas de uso de videos.
      </p>
    </div>
  </div>
);

const OptimizationTab = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium mb-4">Herramientas de Optimización</h3>
      <p className="text-gray-600">
        Próximamente: Herramientas automáticas de optimización de rendimiento y almacenamiento.
      </p>
    </div>
  </div>
);

const SecurityTab = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium mb-4">Auditoría y Seguridad</h3>
      <p className="text-gray-600">
        Próximamente: Sistema completo de auditoría de integridad y seguridad de videos.
      </p>
    </div>
  </div>
);

const SettingsTab = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium mb-4">Configuración del Sistema</h3>
      <p className="text-gray-600">
        Próximamente: Panel de configuración avanzada del sistema de videos.
      </p>
    </div>
  </div>
);

export default VideoAdminDashboard;