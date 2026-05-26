import React, { useState, useRef } from 'react';
import { Search, Upload, Users, AlertCircle, Loader } from 'lucide-react';

interface FaceMatch {
  id: string;
  similarity: number;
  name?: string;
  metadata?: Record<string, any>;
  imageUrl?: string;
}

interface FaceDatabase {
  id: string;
  name: string;
  faceCount: number;
  lastUpdated: number;
}

interface FaceSearchConfig {
  model: 'insightface' | 'face_recognition';
  similarityThreshold: number;
  maxResults: number;
  enableTracking: boolean;
}

/**
 * Face Search Component
 * 
 * Integra reconocimiento facial con InsightFace
 * - Búsqueda de personas en base de datos local
 * - Detección y reconocimiento de rostros
 * - Ejecución offline
 * - Privacidad garantizada
 */

export const FaceSearch: React.FC<{
  isEnabled?: boolean;
  onFaceMatches?: (matches: FaceMatch[]) => void;
}> = ({ isEnabled = false, onFaceMatches }) => {
  const [config, setConfig] = useState<FaceSearchConfig>({
    model: 'insightface',
    similarityThreshold: 0.6,
    maxResults: 5,
    enableTracking: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelStatus, setModelStatus] = useState<'idle' | 'downloading' | 'loaded'>('idle');
  const [matches, setMatches] = useState<FaceMatch[]>([]);
  const [databases, setDatabases] = useState<FaceDatabase[]>([
    { id: 'default', name: 'Default Database', faceCount: 1250, lastUpdated: Date.now() },
    { id: 'suspects', name: 'Suspects Database', faceCount: 342, lastUpdated: Date.now() - 86400000 },
    { id: 'employees', name: 'Employees Database', faceCount: 5680, lastUpdated: Date.now() - 3600000 },
  ]);
  const [selectedDatabase, setSelectedDatabase] = useState('default');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Cargar modelo de reconocimiento facial
   */
  const loadModel = async () => {
    try {
      setIsLoading(true);
      setModelStatus('downloading');
      setError(null);

      // Simular descarga de modelo
      await new Promise(resolve => setTimeout(resolve, 2000));

      setModelStatus('loaded');
      console.log(`${config.model} model loaded`);
    } catch (err) {
      setError('Error loading model');
      setModelStatus('idle');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Buscar rostros en base de datos
   */
  const searchFaces = async (imageUrl: string) => {
    if (modelStatus !== 'loaded') {
      setError('Model not loaded. Please load model first.');
      return;
    }

    try {
      setIsSearching(true);
      setError(null);

      const img = new Image();
      img.onload = async () => {
        if (!canvasRef.current) return;

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        canvasRef.current.width = img.width;
        canvasRef.current.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Simular búsqueda (en producción, llamaría a InsightFace)
        const simulatedMatches: FaceMatch[] = [
          {
            id: 'person_001',
            similarity: 0.98,
            name: 'John Doe',
            metadata: { age: 35, gender: 'M', location: 'New York' },
          },
          {
            id: 'person_002',
            similarity: 0.92,
            name: 'Jane Smith',
            metadata: { age: 28, gender: 'F', location: 'Los Angeles' },
          },
          {
            id: 'person_003',
            similarity: 0.87,
            name: 'Unknown Person',
            metadata: { age: 42, gender: 'M', location: 'Chicago' },
          },
          {
            id: 'person_004',
            similarity: 0.81,
            name: 'Robert Johnson',
            metadata: { age: 55, gender: 'M', location: 'Houston' },
          },
          {
            id: 'person_005',
            similarity: 0.76,
            name: 'Maria Garcia',
            metadata: { age: 31, gender: 'F', location: 'Phoenix' },
          },
        ];

        // Filtrar por umbral de similitud
        const filtered = simulatedMatches.filter(m => m.similarity >= config.similarityThreshold);
        setMatches(filtered.slice(0, config.maxResults));
        onFaceMatches?.(filtered.slice(0, config.maxResults));
      };

      img.onerror = () => {
        setError('Error loading image');
      };

      img.src = imageUrl;
    } catch (err) {
      setError('Error searching faces');
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Manejar carga de archivo
   */
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      searchFaces(imageUrl);
    };
    reader.readAsDataURL(file);
  };

  /**
   * Agregar rostro a base de datos
   */
  const addFaceToDatabase = () => {
    setDatabases(databases.map(db => 
      db.id === selectedDatabase 
        ? { ...db, faceCount: db.faceCount + 1, lastUpdated: Date.now() }
        : db
    ));
  };

  if (!isEnabled) {
    return null;
  }

  return (
    <div className="fixed bottom-96 right-8 z-40 w-96 bg-slate-900 border border-slate-700 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-500" />
          <span className="text-sm font-semibold text-white">Face Search</span>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {/* Estado del Modelo */}
        <div className="p-3 bg-slate-800 rounded text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300">Modelo de Reconocimiento</span>
            <span className={`px-2 py-1 rounded ${
              modelStatus === 'loaded' ? 'bg-green-900 text-green-200' :
              modelStatus === 'downloading' ? 'bg-yellow-900 text-yellow-200' :
              'bg-red-900 text-red-200'
            }`}>
              {modelStatus === 'loaded' ? 'Cargado' :
               modelStatus === 'downloading' ? 'Descargando' :
               'No cargado'}
            </span>
          </div>

          {modelStatus === 'idle' && (
            <button
              onClick={loadModel}
              disabled={isLoading}
              className="w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader className="w-3 h-3 animate-spin" />
                  Cargando...
                </>
              ) : (
                'Cargar Modelo'
              )}
            </button>
          )}
        </div>

        {/* Selección de Base de Datos */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Base de Datos
          </label>
          <select
            value={selectedDatabase}
            onChange={(e) => setSelectedDatabase(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-xs"
          >
            {databases.map(db => (
              <option key={db.id} value={db.id}>
                {db.name} ({db.faceCount})
              </option>
            ))}
          </select>
        </div>

        {/* Configuración */}
        <div className="space-y-2 p-3 bg-slate-800 rounded">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Modelo
            </label>
            <select
              value={config.model}
              onChange={(e) => setConfig({ ...config, model: e.target.value as any })}
              className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-xs"
            >
              <option value="insightface">InsightFace (Más preciso)</option>
              <option value="face_recognition">Face Recognition (Más rápido)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Similitud: {(config.similarityThreshold * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.similarityThreshold}
              onChange={(e) => setConfig({ ...config, similarityThreshold: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Máximo de Resultados: {config.maxResults}
            </label>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={config.maxResults}
              onChange={(e) => setConfig({ ...config, maxResults: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-900 border border-red-700 rounded flex gap-2 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Botones de Acción */}
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={modelStatus !== 'loaded' || isSearching}
            className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSearching ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Buscando
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Buscar
              </>
            )}
          </button>
          <button
            onClick={addFaceToDatabase}
            disabled={modelStatus !== 'loaded'}
            className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Agregar
          </button>
        </div>

        {/* Canvas oculto */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Resultados */}
        {matches.length > 0 && (
          <div className="border-t border-slate-700 pt-3">
            <h4 className="text-xs font-semibold text-slate-300 mb-2">
              Coincidencias ({matches.length})
            </h4>
            <div className="space-y-2">
              {matches.map((match, index) => (
                <div
                  key={match.id}
                  className="p-2 bg-slate-800 rounded text-xs border-l-2 border-emerald-500"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white">
                      #{index + 1} - {match.name || 'Unknown'}
                    </span>
                    <span className="text-emerald-400">
                      {(match.similarity * 100).toFixed(1)}%
                    </span>
                  </div>
                  {match.metadata && (
                    <div className="text-slate-400 text-xs">
                      {match.metadata.age && `Age: ${match.metadata.age} | `}
                      {match.metadata.gender && `Gender: ${match.metadata.gender} | `}
                      {match.metadata.location && `Location: ${match.metadata.location}`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept="image/*"
        onChange={handleFileUpload}
      />
    </div>
  );
};

export default FaceSearch;
