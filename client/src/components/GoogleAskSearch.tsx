import React, { useState, useRef, useEffect } from 'react';
import { Search, Mic, X, AlertCircle, Loader } from 'lucide-react';

interface SearchResult {
  title: string;
  snippet: string;
  link: string;
  source: string;
}

interface GoogleAskConfig {
  enableVoiceInput: boolean;
  enableVoiceOutput: boolean;
  language: string;
  maxResults: number;
}

/**
 * Google Ask Search Component
 * 
 * Integra búsqueda de Google con:
 * - Entrada por voz (STT)
 * - Salida por voz (TTS)
 * - Búsqueda natural
 * - Resultados contextuales
 */

export const GoogleAskSearch: React.FC<{
  isEnabled?: boolean;
  onSearch?: (query: string, results: SearchResult[]) => void;
}> = ({ isEnabled = false, onSearch }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const [config, setConfig] = useState<GoogleAskConfig>({
    enableVoiceInput: true,
    enableVoiceOutput: true,
    language: 'es-ES',
    maxResults: 5,
  });

  // Inicializar Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = config.language;

        recognitionRef.current.onstart = () => {
          setIsListening(true);
          setError(null);
        };

        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              setQuery(transcript);
              performSearch(transcript);
            } else {
              interimTranscript += transcript;
            }
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          setError(`Error de reconocimiento: ${event.error}`);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }

      synthRef.current = window.speechSynthesis;
    }
  }, [config.language]);

  /**
   * Realizar búsqueda
   */
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      setError(null);

      // Llamar a API de búsqueda (Google Custom Search o similar)
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          maxResults: config.maxResults,
        }),
      });

      if (!response.ok) {
        throw new Error('Error en búsqueda');
      }

      const data = await response.json();
      setResults(data.results || []);
      onSearch?.(searchQuery, data.results || []);

      // Reproducir resultado por voz
      if (config.enableVoiceOutput && data.results && data.results.length > 0) {
        const summary = `Encontré ${data.results.length} resultados. El primero es: ${data.results[0].title}`;
        speakResult(summary);
      }
    } catch (err) {
      setError('Error al realizar búsqueda');
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Iniciar escucha de voz
   */
  const startVoiceInput = () => {
    if (!config.enableVoiceInput || !recognitionRef.current) {
      setError('Entrada por voz no disponible');
      return;
    }
    recognitionRef.current.start();
  };

  /**
   * Detener escucha
   */
  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    setIsListening(false);
  };

  /**
   * Reproducir resultado por voz
   */
  const speakResult = (text: string) => {
    if (!config.enableVoiceOutput || !synthRef.current) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = config.language;
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onerror = (event) => {
      setError(`Error de síntesis: ${event.error}`);
    };

    synthRef.current.speak(utterance);
  };

  /**
   * Manejar clic en resultado
   */
  const handleResultClick = (result: SearchResult) => {
    setSelectedResult(result);
    if (config.enableVoiceOutput) {
      speakResult(`Abriendo: ${result.title}`);
    }
    // Abrir en nueva pestaña
    window.open(result.link, '_blank');
  };

  if (!isEnabled) {
    return null;
  }

  return (
    <div className="fixed top-20 right-8 z-40 w-96 bg-slate-900 border border-slate-700 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-cyan-500" />
          <span className="text-sm font-semibold text-white">Google Ask</span>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && performSearch(query)}
            placeholder="Pregunta algo..."
            className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400 text-sm"
          />
          <button
            onClick={() => performSearch(query)}
            disabled={isSearching}
            className="px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </button>
          {config.enableVoiceInput && (
            <button
              onClick={isListening ? stopVoiceInput : startVoiceInput}
              className={`px-3 py-2 rounded font-medium text-sm transition-colors ${
                isListening
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-sky-600 hover:bg-sky-700 text-white'
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Estado de escucha */}
        {isListening && (
          <div className="text-xs text-sky-400 flex items-center gap-2">
            <div className="w-2 h-2 bg-sky-400 rounded-full animate-pulse" />
            Escuchando...
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-900 border-b border-red-700 flex gap-2 text-sm text-red-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Resultados */}
      <div className="max-h-96 overflow-y-auto">
        {isSearching ? (
          <div className="p-8 flex flex-col items-center justify-center gap-3">
            <Loader className="w-6 h-6 text-cyan-500 animate-spin" />
            <span className="text-sm text-slate-400">Buscando...</span>
          </div>
        ) : results.length > 0 ? (
          <div className="divide-y divide-slate-700">
            {results.map((result, index) => (
              <button
                key={index}
                onClick={() => handleResultClick(result)}
                className="w-full text-left p-3 hover:bg-slate-800 transition-colors"
              >
                <div className="font-semibold text-sm text-cyan-400 mb-1 truncate">
                  {result.title}
                </div>
                <div className="text-xs text-slate-400 mb-1 line-clamp-2">
                  {result.snippet}
                </div>
                <div className="text-xs text-slate-500">{result.source}</div>
              </button>
            ))}
          </div>
        ) : query ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No se encontraron resultados
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 text-sm">
            Realiza una búsqueda para ver resultados
          </div>
        )}
      </div>

      {/* Configuración rápida */}
      <div className="bg-slate-800 border-t border-slate-700 p-3 space-y-2">
        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={config.enableVoiceInput}
            onChange={(e) => setConfig({ ...config, enableVoiceInput: e.target.checked })}
            className="w-3 h-3"
          />
          Entrada por voz
        </label>
        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={config.enableVoiceOutput}
            onChange={(e) => setConfig({ ...config, enableVoiceOutput: e.target.checked })}
            className="w-3 h-3"
          />
          Salida por voz
        </label>
      </div>
    </div>
  );
};

export default GoogleAskSearch;
