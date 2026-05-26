/**
 * Performance Optimization Utilities para WarNet Command V4
 * 
 * Incluye:
 * - Lazy loading de componentes
 * - Caché de resultados
 * - Compresión de imágenes
 * - Debouncing/Throttling
 * - Service Workers
 */

/**
 * Lazy Loading Utilities
 */
export const lazyLoadComponent = (importStatement: () => Promise<{ default: React.ComponentType<any> }>) => {
  return React.lazy(importStatement);
};

/**
 * Cache Manager
 */
export class CacheManager {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private maxSize: number = 100;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  /**
   * Guardar en caché
   */
  set(key: string, data: any, ttl: number = 3600000): void {
    if (this.cache.size >= this.maxSize) {
      // Eliminar entrada más antigua
      const firstKey = this.cache.keys().next().value as string | undefined;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Obtener del caché
   */
  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Verificar si ha expirado
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Limpiar caché
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Obtener tamaño del caché
   */
  size(): number {
    return this.cache.size;
  }
}

/**
 * Debounce - Ejecutar función después de X ms sin llamadas
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

/**
 * Throttle - Ejecutar función máximo cada X ms
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * Image Optimization
 */
export const optimizeImage = async (
  imageUrl: string,
  maxWidth: number = 1280,
  quality: number = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // Calcular nuevas dimensiones
      let width = img.width;
      let height = img.height;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // Convertir a blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            resolve(url);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
};

/**
 * Performance Monitoring
 */
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  /**
   * Medir tiempo de ejecución
   */
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(`${name}_error`, duration);
      throw error;
    }
  }

  /**
   * Medir tiempo de ejecución síncrono
   */
  measure<T>(name: string, fn: () => T): T {
    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(`${name}_error`, duration);
      throw error;
    }
  }

  /**
   * Registrar métrica
   */
  private recordMetric(name: string, duration: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(duration);
  }

  /**
   * Obtener estadísticas
   */
  getStats(name: string) {
    const values = this.metrics.get(name) || [];
    if (values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = sorted[0];
    const max = sorted[values.length - 1];
    const median = sorted[Math.floor(sorted.length / 2)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];

    return {
      count: values.length,
      avg: Math.round(avg * 100) / 100,
      min: Math.round(min * 100) / 100,
      max: Math.round(max * 100) / 100,
      median: Math.round(median * 100) / 100,
      p95: Math.round(p95 * 100) / 100,
      p99: Math.round(p99 * 100) / 100,
    };
  }

  /**
   * Obtener todas las estadísticas
   */
  getAllStats() {
    const stats: Record<string, any> = {};
    this.metrics.forEach((_, name: string) => {
      stats[name] = this.getStats(name);
    });
    return stats;
  }

  /**
   * Limpiar métricas
   */
  clear(): void {
    this.metrics.clear();
  }
}

/**
 * Service Worker Registration
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    console.log('Service Worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
};

/**
 * Unregister Service Worker
 */
export const unregisterServiceWorker = async (): Promise<void> => {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
    console.log('Service Workers unregistered');
  } catch (error) {
    console.error('Service Worker unregistration failed:', error);
  }
};

/**
 * Request Batching para reducir número de requests
 */
export class RequestBatcher {
  private queue: Array<{ id: string; data: any }> = [];
  private batchSize: number = 10;
  private batchDelay: number = 100;
  private timeoutId: NodeJS.Timeout | null = null;
  private onBatch: (batch: Array<{ id: string; data: any }>) => Promise<void>;

  constructor(
    onBatch: (batch: Array<{ id: string; data: any }>) => Promise<void>,
    batchSize: number = 10,
    batchDelay: number = 100
  ) {
    this.onBatch = onBatch;
    this.batchSize = batchSize;
    this.batchDelay = batchDelay;
  }

  /**
   * Agregar item a la cola
   */
  add(id: string, data: any): void {
    this.queue.push({ id, data });

    if (this.queue.length >= this.batchSize) {
      this.flush();
    } else if (!this.timeoutId) {
      this.timeoutId = setTimeout(() => {
        this.flush();
      }, this.batchDelay);
    }
  }

  /**
   * Procesar lote
   */
  private async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    const batch = this.queue.splice(0, this.batchSize);
    try {
      await this.onBatch(batch);
    } catch (error) {
      console.error('Batch processing error:', error);
      // Reintentar
      this.queue.unshift(...batch);
    }
  }

  /**
   * Forzar procesamiento
   */
  async forceFlush(): Promise<void> {
    while (this.queue.length > 0) {
      await this.flush();
    }
  }
}

/**
 * Memory Leak Detection
 */
export class MemoryLeakDetector {
  private initialMemory: number = 0;
  private threshold: number = 50; // MB

  start(): void {
    const perfMemory = (performance as any).memory;
    if (perfMemory) {
      this.initialMemory = perfMemory.usedJSHeapSize / 1048576; // Convert to MB
    }
  }

  check(): { used: number; increase: number; isLeaking: boolean } {
    const perfMemory = (performance as any).memory;
    if (!perfMemory) {
      return { used: 0, increase: 0, isLeaking: false };
    }

    const currentMemory = perfMemory.usedJSHeapSize / 1048576;
    const increase = currentMemory - this.initialMemory;
    const isLeaking = increase > this.threshold;

    return {
      used: Math.round(currentMemory * 100) / 100,
      increase: Math.round(increase * 100) / 100,
      isLeaking,
    };
  }
}

/**
 * Singleton instances
 */
export const cacheManager = new CacheManager();
export const performanceMonitor = new PerformanceMonitor();
export const memoryLeakDetector = new MemoryLeakDetector();

// Importar React para lazy loading
import React from 'react';
