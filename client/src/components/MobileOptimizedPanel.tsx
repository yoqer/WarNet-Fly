import React, { useState, useEffect } from 'react';
import { Menu, X, Zap, AlertTriangle } from 'lucide-react';

// Extender Performance para incluir memory (Chrome-specific)
interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
    jsHeapSizeLimit: number;
    jsHeapTotalSize: number;
  };
}

interface MobileOptimizedPanelProps {
  onMenuToggle?: (isOpen: boolean) => void;
}

export const MobileOptimizedPanel: React.FC<MobileOptimizedPanelProps> = ({ onMenuToggle }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [fps, setFps] = useState(60);

  // Detectar cambios de tamaño
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Monitorear uso de memoria
  useEffect(() => {
    const memoryInterval = setInterval(() => {
      const perfWithMemory = performance as PerformanceWithMemory;
      if (perfWithMemory.memory) {
        const usage = (perfWithMemory.memory.usedJSHeapSize / perfWithMemory.memory.jsHeapSizeLimit) * 100;
        setMemoryUsage(Math.round(usage));
      }
    }, 1000);
    return () => clearInterval(memoryInterval);
  }, []);

  // Monitorear FPS
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();

    const countFrames = () => {
      frameCount++;
      const currentTime = performance.now();
      if (currentTime - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = currentTime;
      }
      requestAnimationFrame(countFrames);
    };

    const frameCounter = requestAnimationFrame(countFrames);
    return () => cancelAnimationFrame(frameCounter);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (onMenuToggle) {
      onMenuToggle(!isMenuOpen);
    }
  };

  const menuItems = [
    { label: 'Dashboard', icon: '📊', id: 'dashboard' },
    { label: 'Sensores', icon: '📡', id: 'sensors' },
    { label: 'Enjambre', icon: '🐝', id: 'swarm' },
    { label: 'Alertas', icon: '🚨', id: 'alerts' },
    { label: 'Configuración', icon: '⚙️', id: 'settings' },
  ];

  return (
    <div className={`${isMobile ? 'fixed' : 'relative'} top-0 left-0 right-0 z-50 bg-gray-900 text-white`}>
      {/* Header */}
      <div className="flex justify-between items-center p-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-500" />
          <h1 className={`font-bold ${isMobile ? 'text-sm' : 'text-lg'}`}>WarNet V4</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Indicadores de rendimiento */}
          <div className={`flex items-center gap-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            <span className={fps < 30 ? 'text-red-500' : 'text-green-500'}>
              {fps} FPS
            </span>
            <span className={memoryUsage > 80 ? 'text-red-500' : 'text-green-500'}>
              {memoryUsage}%
            </span>
          </div>

          {isMobile && (
            <button
              onClick={toggleMenu}
              className="p-2 hover:bg-gray-700 rounded"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Menu Móvil */}
      {isMobile && isMenuOpen && (
        <div className="bg-gray-800 border-b border-gray-700 max-h-96 overflow-y-auto">
          {menuItems.map(item => (
            <button
              key={item.id}
              className="w-full text-left px-4 py-3 hover:bg-gray-700 border-b border-gray-700 flex items-center gap-2 text-sm"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Menu Desktop */}
      {!isMobile && (
        <div className="flex gap-1 px-3 py-2 bg-gray-800 overflow-x-auto">
          {menuItems.map(item => (
            <button
              key={item.id}
              className="px-3 py-2 hover:bg-gray-700 rounded text-sm whitespace-nowrap flex items-center gap-1"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Alertas de Rendimiento */}
      {(memoryUsage > 80 || fps < 30) && (
        <div className="bg-yellow-900 border-b border-yellow-700 px-3 py-2 flex items-center gap-2 text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>
            {memoryUsage > 80 && 'Uso de memoria alto. '}
            {fps < 30 && 'FPS bajo. '}
            Considera cerrar algunas funciones.
          </span>
        </div>
      )}
    </div>
  );
};
