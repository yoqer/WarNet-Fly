/**
 * Configuración de Modelos de Voz para WarNet Command V4
 * 
 * Soporta múltiples modelos de STT/TTS optimizados para móvil y ordenador
 */

export interface VoiceModelConfig {
  id: string;
  name: string;
  type: 'stt' | 'tts' | 'both';
  platform: 'browser' | 'mobile' | 'desktop' | 'api';
  provider: string;
  description: string;
  requirements: string[];
  isDefault: boolean;
  isOpenSource: boolean;
  url?: string;
  downloadUrl?: string;
}

/**
 * Modelos de STT (Speech-to-Text)
 */
export const STT_MODELS: VoiceModelConfig[] = [
  {
    id: 'browser-stt',
    name: 'Navegador Nativo (Web Speech API)',
    type: 'stt',
    platform: 'browser',
    provider: 'Chrome/Edge/Safari',
    description: 'Reconocimiento de voz nativo del navegador sin dependencias externas',
    requirements: ['Chrome 25+', 'Edge 79+', 'Safari 14.1+'],
    isDefault: true,
    isOpenSource: false,
    url: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API',
  },
  {
    id: 'vibevoice-stt',
    name: 'VibeVoice-Realtime-0.5B (Microsoft)',
    type: 'stt',
    platform: 'mobile',
    provider: 'Microsoft / Hugging Face',
    description: 'Modelo ligero optimizado para móvil, latencia <100ms, tamaño 500MB',
    requirements: ['Node.js 14+', 'transformers.js', 'ONNX Runtime'],
    isDefault: false,
    isOpenSource: true,
    url: 'https://huggingface.co/microsoft/VibeVoice-Realtime-0.5B',
    downloadUrl: 'https://huggingface.co/microsoft/VibeVoice-Realtime-0.5B/resolve/main/model.onnx',
  },
  {
    id: 'whisper-stt',
    name: 'Whisper (OpenAI)',
    type: 'stt',
    platform: 'desktop',
    provider: 'OpenAI',
    description: 'Modelo robusto de reconocimiento de voz, soporta múltiples idiomas',
    requirements: ['Python 3.8+', 'PyTorch', 'openai-whisper'],
    isDefault: false,
    isOpenSource: true,
    url: 'https://github.com/openai/whisper',
    downloadUrl: 'https://github.com/openai/whisper/releases',
  },
  {
    id: 'coqui-stt',
    name: 'Coqui STT',
    type: 'stt',
    platform: 'desktop',
    provider: 'Coqui',
    description: 'Motor STT open source, bajo consumo, múltiples idiomas',
    requirements: ['Python 3.6+', 'TensorFlow', 'coqui-stt'],
    isDefault: false,
    isOpenSource: true,
    url: 'https://github.com/coqui-ai/STT',
    downloadUrl: 'https://github.com/coqui-ai/STT/releases',
  },
];

/**
 * Modelos de TTS (Text-to-Speech)
 */
export const TTS_MODELS: VoiceModelConfig[] = [
  {
    id: 'browser-tts',
    name: 'Navegador Nativo (Web Speech API)',
    type: 'tts',
    platform: 'browser',
    provider: 'Chrome/Edge/Safari',
    description: 'Síntesis de voz nativa del navegador con múltiples voces',
    requirements: ['Chrome 14+', 'Edge 79+', 'Safari 7+'],
    isDefault: true,
    isOpenSource: false,
    url: 'https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis',
  },
  {
    id: 'vibevoice-tts',
    name: 'VibeVoice-Realtime-0.5B (Microsoft)',
    type: 'tts',
    platform: 'mobile',
    provider: 'Microsoft / Hugging Face',
    description: 'Síntesis de voz ligera para móvil, naturalidad optimizada',
    requirements: ['Node.js 14+', 'transformers.js', 'ONNX Runtime'],
    isDefault: false,
    isOpenSource: true,
    url: 'https://huggingface.co/microsoft/VibeVoice-Realtime-0.5B',
    downloadUrl: 'https://huggingface.co/microsoft/VibeVoice-Realtime-0.5B/resolve/main/model.onnx',
  },
  {
    id: 'coqui-tts',
    name: 'Coqui TTS',
    type: 'tts',
    platform: 'desktop',
    provider: 'Coqui',
    description: 'Motor TTS open source, voces naturales, múltiples idiomas',
    requirements: ['Python 3.6+', 'PyTorch', 'TTS'],
    isDefault: false,
    isOpenSource: true,
    url: 'https://github.com/coqui-ai/TTS',
    downloadUrl: 'https://github.com/coqui-ai/TTS/releases',
  },
  {
    id: 'pyttsx3-tts',
    name: 'pyttsx3 (Nativo del SO)',
    type: 'tts',
    platform: 'desktop',
    provider: 'Sistema Operativo',
    description: 'Síntesis de voz nativa del SO (Windows SAPI, macOS AVFoundation, Linux espeak)',
    requirements: ['Python 3.6+', 'pyttsx3'],
    isDefault: false,
    isOpenSource: true,
    url: 'https://github.com/nateshmbhat/pyttsx3',
    downloadUrl: 'https://pypi.org/project/pyttsx3/',
  },
  {
    id: 'google-cloud-tts',
    name: 'Google Cloud TTS',
    type: 'tts',
    platform: 'api',
    provider: 'Google Cloud',
    description: 'Síntesis de voz de alta calidad vía API (requiere credenciales)',
    requirements: ['API Key Google Cloud', 'Conexión a Internet'],
    isDefault: false,
    isOpenSource: false,
    url: 'https://cloud.google.com/text-to-speech',
  },
];

/**
 * Configuración de Idiomas Soportados
 */
export const SUPPORTED_LANGUAGES = [
  { code: 'es-ES', name: 'Español (España)' },
  { code: 'es-MX', name: 'Español (México)' },
  { code: 'en-US', name: 'English (United States)' },
  { code: 'en-GB', name: 'English (United Kingdom)' },
  { code: 'fr-FR', name: 'Français (France)' },
  { code: 'de-DE', name: 'Deutsch (Germany)' },
  { code: 'it-IT', name: 'Italiano (Italy)' },
  { code: 'pt-BR', name: 'Português (Brasil)' },
  { code: 'ja-JP', name: '日本語 (Japan)' },
  { code: 'zh-CN', name: '中文 (Simplified Chinese)' },
];

/**
 * Configuración por defecto para diferentes plataformas
 */
export const DEFAULT_CONFIGS = {
  mobile: {
    sttModel: 'vibevoice-stt',
    ttsModel: 'vibevoice-tts',
    language: 'es-ES',
    autoSpeak: true,
  },
  desktop: {
    sttModel: 'browser-stt',
    ttsModel: 'browser-tts',
    language: 'es-ES',
    autoSpeak: true,
  },
  browser: {
    sttModel: 'browser-stt',
    ttsModel: 'browser-tts',
    language: 'es-ES',
    autoSpeak: true,
  },
};

/**
 * Obtener modelo por ID
 */
export const getSTTModel = (id: string): VoiceModelConfig | undefined => {
  return STT_MODELS.find(m => m.id === id);
};

export const getTTSModel = (id: string): VoiceModelConfig | undefined => {
  return TTS_MODELS.find(m => m.id === id);
};

/**
 * Obtener modelos recomendados para plataforma
 */
export const getRecommendedModels = (platform: 'mobile' | 'desktop' | 'browser') => {
  const config = DEFAULT_CONFIGS[platform];
  return {
    stt: getSTTModel(config.sttModel),
    tts: getTTSModel(config.ttsModel),
  };
};

/**
 * Verificar si modelo está disponible en plataforma actual
 */
export const isModelAvailable = (model: VoiceModelConfig): boolean => {
  if (model.platform === 'browser') {
    return typeof window !== 'undefined';
  }
  if (model.platform === 'mobile') {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  if (model.platform === 'desktop') {
    return !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  return true;
};

/**
 * Obtener modelos disponibles para plataforma actual
 */
export const getAvailableModels = (type: 'stt' | 'tts' | 'both' = 'both') => {
  const models = type === 'stt' ? STT_MODELS : type === 'tts' ? TTS_MODELS : [...STT_MODELS, ...TTS_MODELS];
  return models.filter(m => isModelAvailable(m));
};
