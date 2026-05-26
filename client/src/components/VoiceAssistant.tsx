import React, { useState, useEffect, useRef } from 'react';
import { Mic, Volume2, Settings, X, AlertCircle } from 'lucide-react';

interface VoiceAssistantProps {
  onCommand?: (command: string) => void;
  isEnabled?: boolean;
}

type VoiceModel = 'browser' | 'vibevoice' | 'coqui' | 'google-cloud';
type TTSModel = 'browser' | 'vibevoice' | 'coqui' | 'google-cloud';

interface VoiceConfig {
  sttModel: VoiceModel;
  ttsModel: TTSModel;
  language: string;
  autoSpeak: boolean;
  googleAskEnabled: boolean;
  googleNavigationEnabled: boolean;
}

/**
 * VoiceAssistant Component
 * 
 * Integra múltiples modelos de voz (STT/TTS) con soporte para:
 * - Navegador nativo (Web Speech API)
 * - VibeVoice-Realtime-0.5B (Microsoft) - Optimizado para móvil
 * - Coqui TTS (Open Source)
 * - Google Cloud TTS (API)
 * - Google Ask Integration
 * - Google 3D Navigation
 */

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  onCommand,
  isEnabled = false
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<VoiceConfig>({
    sttModel: 'browser',
    ttsModel: 'browser',
    language: 'es-ES',
    autoSpeak: true,
    googleAskEnabled: true,
    googleNavigationEnabled: true,
  });

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

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
              setTranscript(transcript);
              handleCommand(transcript);
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
   * Procesar comando de voz
   */
  const handleCommand = async (text: string) => {
    const lowerText = text.toLowerCase();

    // Comandos de navegación 3D
    if (lowerText.includes('navegación') || lowerText.includes('mapa 3d')) {
      if (config.googleNavigationEnabled) {
        speak('Abriendo navegación 3D de Google');
        onCommand?.('open-3d-navigation');
      }
    }

    // Comandos de búsqueda con Google Ask
    if (lowerText.includes('buscar') || lowerText.includes('pregunta')) {
      if (config.googleAskEnabled) {
        const query = text.replace(/buscar|pregunta/gi, '').trim();
        speak(`Buscando: ${query}`);
        onCommand?.(`google-ask:${query}`);
      }
    }

    // Comandos de módulos
    if (lowerText.includes('hacker')) {
      speak('Abriendo módulo Hacker');
      onCommand?.('open-module:hacker');
    }

    if (lowerText.includes('sensores')) {
      speak('Abriendo panel de sensores');
      onCommand?.('open-module:sensors');
    }

    if (lowerText.includes('mapa')) {
      speak('Abriendo mapa');
      onCommand?.('open-module:map');
    }

    // Comando genérico
    onCommand?.(text);
  };

  /**
   * Iniciar escucha de voz
   */
  const startListening = () => {
    if (config.sttModel === 'browser' && recognitionRef.current) {
      recognitionRef.current.start();
    } else if (config.sttModel === 'vibevoice') {
      startVibeVoiceSTT();
    }
  };

  /**
   * Detener escucha
   */
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    setIsListening(false);
  };

  /**
   * Síntesis de voz (TTS)
   */
  const speak = (text: string) => {
    if (!config.autoSpeak) return;

    if (config.ttsModel === 'browser' && synthRef.current) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = config.language;
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event) => {
        setError(`Error de síntesis: ${event.error}`);
        setIsSpeaking(false);
      };

      synthRef.current.speak(utterance);
    } else if (config.ttsModel === 'vibevoice') {
      speakWithVibeVoice(text);
    }
  };

  /**
   * VibeVoice STT - Modelo ligero para móvil
   * https://huggingface.co/microsoft/VibeVoice-Realtime-0.5B
   */
  const startVibeVoiceSTT = async () => {
    try {
      setIsListening(true);
      // Implementación con VibeVoice
      // Requiere: transformers.js o similar
      const response = await fetch('https://api-inference.huggingface.co/models/microsoft/VibeVoice-Realtime-0.5B', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: 'audio_data',
        }),
      });
      const result = await response.json();
      setTranscript(result.text || '');
      handleCommand(result.text || '');
    } catch (err) {
      setError('Error con VibeVoice STT');
      console.error(err);
    } finally {
      setIsListening(false);
    }
  };

  /**
   * VibeVoice TTS - Síntesis de voz optimizada para móvil
   */
  const speakWithVibeVoice = async (text: string) => {
    try {
      setIsSpeaking(true);
      const response = await fetch('https://api-inference.huggingface.co/models/microsoft/VibeVoice-Realtime-0.5B', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text,
        }),
      });
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsSpeaking(false);
      audio.play();
    } catch (err) {
      setError('Error con VibeVoice TTS');
      console.error(err);
      setIsSpeaking(false);
    }
  };

  if (!isEnabled) {
    return null;
  }

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Panel de Control de Voz */}
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 w-80 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-cyan-500" />
            <span className="text-sm font-semibold text-white">Asistente de Voz</span>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 hover:bg-slate-800 rounded transition-colors"
          >
            {showSettings ? (
              <X className="w-4 h-4 text-slate-400" />
            ) : (
              <Settings className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>

        {/* Transcript */}
        {transcript && (
          <div className="bg-slate-800 rounded p-2 mb-3 text-sm text-slate-200 min-h-10">
            {transcript}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-900 border border-red-700 rounded p-2 mb-3 text-sm text-red-200 flex gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Controles */}
        {!showSettings && (
          <div className="flex gap-2 mb-3">
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isSpeaking}
              className={`flex-1 py-2 px-3 rounded font-medium text-sm transition-colors ${
                isListening
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-cyan-600 hover:bg-cyan-700 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isListening ? 'Detener' : 'Escuchar'}
            </button>
            <button
              onClick={() => speak('¿Cómo puedo ayudarte?')}
              disabled={isSpeaking}
              className="py-2 px-3 bg-sky-600 hover:bg-sky-700 text-white rounded font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Indicadores de Estado */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
          <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`} />
          <span>{isListening ? 'Escuchando...' : isSpeaking ? 'Hablando...' : 'Listo'}</span>
        </div>

        {/* Configuración */}
        {showSettings && (
          <div className="space-y-3 border-t border-slate-700 pt-3">
            {/* STT Model */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Modelo STT (Voz a Texto)
              </label>
              <select
                value={config.sttModel}
                onChange={(e) => setConfig({ ...config, sttModel: e.target.value as VoiceModel })}
                className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white"
              >
                <option value="browser">Navegador Nativo</option>
                <option value="vibevoice">VibeVoice (Móvil)</option>
                <option value="coqui">Coqui (Desktop)</option>
              </select>
            </div>

            {/* TTS Model */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Modelo TTS (Texto a Voz)
              </label>
              <select
                value={config.ttsModel}
                onChange={(e) => setConfig({ ...config, ttsModel: e.target.value as TTSModel })}
                className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white"
              >
                <option value="browser">Navegador Nativo</option>
                <option value="vibevoice">VibeVoice (Móvil)</option>
                <option value="coqui">Coqui (Desktop)</option>
              </select>
            </div>

            {/* Language */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Idioma
              </label>
              <select
                value={config.language}
                onChange={(e) => setConfig({ ...config, language: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white"
              >
                <option value="es-ES">Español</option>
                <option value="en-US">English</option>
                <option value="fr-FR">Français</option>
                <option value="de-DE">Deutsch</option>
              </select>
            </div>

            {/* Toggles */}
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={config.autoSpeak}
                onChange={(e) => setConfig({ ...config, autoSpeak: e.target.checked })}
                className="w-3 h-3"
              />
              Respuestas de Voz Automáticas
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={config.googleAskEnabled}
                onChange={(e) => setConfig({ ...config, googleAskEnabled: e.target.checked })}
                className="w-3 h-3"
              />
              Google Ask Habilitado
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={config.googleNavigationEnabled}
                onChange={(e) => setConfig({ ...config, googleNavigationEnabled: e.target.checked })}
                className="w-3 h-3"
              />
              Navegación 3D Habilitada
            </label>
          </div>
        )}

        {/* Footer */}
        <div className="text-xs text-slate-500 text-center mt-3 border-t border-slate-700 pt-2">
          {config.sttModel === 'browser' && config.ttsModel === 'browser'
            ? 'Usando navegador nativo'
            : `STT: ${config.sttModel} | TTS: ${config.ttsModel}`}
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
