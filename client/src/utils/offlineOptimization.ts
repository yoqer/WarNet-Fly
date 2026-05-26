/**
 * Offline Optimization Module para WarNet Command V4
 * 
 * Estrategias para ejecución completamente offline:
 * - Service Workers para caché
 * - IndexedDB para almacenamiento
 * - Modelos locales empaquetados
 * - Sincronización offline-online
 */

export interface OfflineConfig {
  enableServiceWorker: boolean;
  enableIndexedDB: boolean;
  cacheModels: boolean;
  autoSync: boolean;
  maxCacheSize: number; // MB
}

export interface CachedModel {
  id: string;
  name: string;
  type: 'yolo' | 'face' | 'voice' | 'video';
  size: number; // bytes
  version: string;
  lastUpdated: number;
  checksum: string;
}

/**
 * Offline Database Manager
 */
export class OfflineDatabase {
  private dbName = 'WarNetOfflineDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Crear object stores
        if (!db.objectStoreNames.contains('models')) {
          db.createObjectStore('models', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('data')) {
          db.createObjectStore('data', { keyPath: 'id' });
        }
      };
    });
  }

  async saveModel(model: CachedModel, data: ArrayBuffer): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(['models'], 'readwrite');
      const store = tx.objectStore('models');

      store.put({
        ...model,
        data,
      });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getModel(id: string): Promise<CachedModel | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(['models'], 'readonly');
      const store = tx.objectStore('models');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllModels(): Promise<CachedModel[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(['models'], 'readonly');
      const store = tx.objectStore('models');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteModel(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(['models'], 'readwrite');
      const store = tx.objectStore('models');

      store.delete(id);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async saveData(key: string, data: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(['data'], 'readwrite');
      const store = tx.objectStore('data');

      store.put({
        id: key,
        data,
        timestamp: Date.now(),
      });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getData(key: string): Promise<any | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(['data'], 'readonly');
      const store = tx.objectStore('data');
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.data : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getStorageSize(): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(['models'], 'readonly');
      const store = tx.objectStore('models');
      const request = store.getAll();

      request.onsuccess = () => {
        const models = request.result;
        const totalSize = models.reduce((sum, model) => sum + model.size, 0);
        resolve(totalSize);
      };
      request.onerror = () => reject(request.error);
    });
  }
}

/**
 * Service Worker Manager
 */
export class ServiceWorkerManager {
  private swPath = '/sw.js';
  private registration: ServiceWorkerRegistration | null = null;

  async register(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Workers not supported');
      return null;
    }

    try {
      this.registration = await navigator.serviceWorker.register(this.swPath, {
        scope: '/',
      });
      console.log('Service Worker registered:', this.registration);
      return this.registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  async unregister(): Promise<void> {
    if (!this.registration) return;

    try {
      await this.registration.unregister();
      console.log('Service Worker unregistered');
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
    }
  }

  async update(): Promise<void> {
    if (!this.registration) return;

    try {
      await this.registration.update();
      console.log('Service Worker updated');
    } catch (error) {
      console.error('Service Worker update failed:', error);
    }
  }

  isActive(): boolean {
    return this.registration?.active !== undefined;
  }
}

/**
 * Offline Sync Manager
 */
export class OfflineSyncManager {
  private pendingSync: Array<{ id: string; action: string; data: any }> = [];
  private isOnline = navigator.onLine;

  constructor() {
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  private handleOnline(): void {
    this.isOnline = true;
    console.log('Back online - syncing pending changes');
    this.syncPendingChanges();
  }

  private handleOffline(): void {
    this.isOnline = false;
    console.log('Offline - queuing changes');
  }

  addPendingSync(id: string, action: string, data: any): void {
    this.pendingSync.push({ id, action, data });
    console.log(`Pending sync added: ${action}`);
  }

  async syncPendingChanges(): Promise<void> {
    if (!this.isOnline || this.pendingSync.length === 0) return;

    try {
      for (const sync of this.pendingSync) {
        await this.sendSync(sync);
      }
      this.pendingSync = [];
      console.log('All pending changes synced');
    } catch (error) {
      console.error('Sync error:', error);
    }
  }

  private async sendSync(sync: { id: string; action: string; data: any }): Promise<void> {
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sync),
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }
  }

  isConnected(): boolean {
    return this.isOnline;
  }

  getPendingCount(): number {
    return this.pendingSync.length;
  }
}

/**
 * Model Packager
 */
export class ModelPackager {
  /**
   * Empaquetar modelo para distribución offline
   */
  static async packageModel(
    modelData: ArrayBuffer,
    metadata: CachedModel
  ): Promise<Blob> {
    // Crear archivo ZIP con modelo + metadata
    const blob = new Blob([modelData], { type: 'application/octet-stream' });
    return blob;
  }

  /**
   * Desempaquetar modelo
   */
  static async unpackageModel(blob: Blob): Promise<{ data: ArrayBuffer; metadata: CachedModel }> {
    const arrayBuffer = await blob.arrayBuffer();
    return {
      data: arrayBuffer,
      metadata: {
        id: 'unpacked',
        name: 'Unpacked Model',
        type: 'yolo',
        size: arrayBuffer.byteLength,
        version: '1.0',
        lastUpdated: Date.now(),
        checksum: '',
      },
    };
  }
}

/**
 * Offline Status Monitor
 */
export class OfflineStatusMonitor {
  private config: OfflineConfig;
  private db: OfflineDatabase;
  private swManager: ServiceWorkerManager;
  private syncManager: OfflineSyncManager;

  constructor(config: OfflineConfig) {
    this.config = config;
    this.db = new OfflineDatabase();
    this.swManager = new ServiceWorkerManager();
    this.syncManager = new OfflineSyncManager();
  }

  async initialize(): Promise<void> {
    await this.db.init();

    if (this.config.enableServiceWorker) {
      await this.swManager.register();
    }
  }

  async getStatus(): Promise<{
    online: boolean;
    serviceWorkerActive: boolean;
    cachedModels: number;
    cacheSize: number;
    pendingSync: number;
  }> {
    const models = await this.db.getAllModels();
    const cacheSize = await this.db.getStorageSize();

    return {
      online: this.syncManager.isConnected(),
      serviceWorkerActive: this.swManager.isActive(),
      cachedModels: models.length,
      cacheSize: cacheSize / (1024 * 1024), // Convert to MB
      pendingSync: this.syncManager.getPendingCount(),
    };
  }

  async cacheModel(model: CachedModel, data: ArrayBuffer): Promise<void> {
    const currentSize = await this.db.getStorageSize();
    const maxBytes = this.config.maxCacheSize * 1024 * 1024;

    if (currentSize + data.byteLength > maxBytes) {
      console.warn('Cache size limit exceeded');
      return;
    }

    await this.db.saveModel(model, data);
  }

  async getCachedModel(id: string): Promise<CachedModel | null> {
    return this.db.getModel(id);
  }

  async clearCache(): Promise<void> {
    const models = await this.db.getAllModels();
    for (const model of models) {
      await this.db.deleteModel(model.id);
    }
  }
}

/**
 * Singleton instances
 */
export const offlineDatabase = new OfflineDatabase();
export const serviceWorkerManager = new ServiceWorkerManager();
export const offlineSyncManager = new OfflineSyncManager();
