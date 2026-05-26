import React, { useState, useEffect } from 'react';
import { ChevronDown, Shield, Zap, Radio, Eye, Lock, ArrowRight } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);
  const [showSecretHint, setShowSecretHint] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              WarNet V4
            </span>
          </div>
          <div className="flex gap-8 items-center">
            <a href="#features" className="text-sm hover:text-cyan-400 transition">
              Características
            </a>
            <a href="#specs" className="text-sm hover:text-cyan-400 transition">
              Especificaciones
            </a>
            <a href="#security" className="text-sm hover:text-cyan-400 transition">
              Seguridad
            </a>
            <button
              onClick={() => setShowSecretHint(!showSecretHint)}
              className="text-sm px-4 py-2 border border-cyan-500/50 rounded hover:border-cyan-400 hover:text-cyan-400 transition"
            >
              Acceso
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
            WarNet Command V4
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Control Inteligente de Dirigibles Autónomos
          </p>
          <p className="text-gray-400 mb-12 max-w-2xl mx-auto">
            Plataforma profesional de monitoreo y control con sensor fusion avanzado, predicción de aterrizaje basada en ML y coordinación de enjambres autónomos.
          </p>

          <div className="flex gap-4 justify-center mb-16 flex-wrap">
            <button
              onClick={() => alert('Contacta con nuestro equipo para acceso al sistema')}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition transform hover:scale-105"
            >
              Acceder al Sistema
            </button>
            <button className="px-8 py-3 border border-cyan-500/50 rounded-lg font-semibold hover:border-cyan-400 hover:text-cyan-400 transition">
              Ver Documentación
            </button>
          </div>

          {/* Scroll indicator */}
          <div className="flex justify-center animate-bounce">
            <ChevronDown className="w-6 h-6 text-cyan-400" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          Características Principales
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="p-6 rounded-lg border border-cyan-500/30 bg-slate-800/50 hover:border-cyan-400 hover:bg-slate-800/80 transition group">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Radio className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Sensor Fusion Avanzado</h3>
            <p className="text-gray-400">
              Integración de múltiples sensores con algoritmos de fusión de datos para máxima precisión en tiempo real.
            </p>
            <div className="mt-4 text-cyan-400 text-sm font-semibold flex items-center gap-2 group-hover:gap-3 transition">
              Más información <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-lg border border-cyan-500/30 bg-slate-800/50 hover:border-cyan-400 hover:bg-slate-800/80 transition group">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Predicción de Aterrizaje ML</h3>
            <p className="text-gray-400">
              Modelos de aprendizaje automático que predicen trayectorias de aterrizaje con precisión del 99.5%.
            </p>
            <div className="mt-4 text-cyan-400 text-sm font-semibold flex items-center gap-2 group-hover:gap-3 transition">
              Más información <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-lg border border-cyan-500/30 bg-slate-800/50 hover:border-cyan-400 hover:bg-slate-800/80 transition group">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Coordinación de Enjambre</h3>
            <p className="text-gray-400">
              Control centralizado de múltiples dirigibles con comunicación inter-dispositivo optimizada.
            </p>
            <div className="mt-4 text-cyan-400 text-sm font-semibold flex items-center gap-2 group-hover:gap-3 transition">
              Más información <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </section>

      {/* Specifications Section */}
      <section id="specs" className="py-20 px-4 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          Especificaciones Técnicas
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-cyan-500/30">
                <th className="px-6 py-4 text-cyan-400 font-semibold">Especificación</th>
                <th className="px-6 py-4 text-cyan-400 font-semibold">Valor</th>
                <th className="px-6 py-4 text-cyan-400 font-semibold">Unidad</th>
              </tr>
            </thead>
            <tbody>
              {[
                { spec: 'Precisión de Sensores', value: '99.5', unit: '%' },
                { spec: 'Latencia de Comunicación', value: '50', unit: 'ms' },
                { spec: 'Objetos Rastreables', value: '100+', unit: 'objetos' },
                { spec: 'Frecuencia de Actualización', value: '60', unit: 'Hz' },
                { spec: 'Cobertura de Red', value: '5', unit: 'km' },
                { spec: 'Tiempo de Respuesta', value: '100', unit: 'ms' },
              ].map((row, idx) => (
                <tr key={idx} className={`border-b border-cyan-500/10 ${idx % 2 === 0 ? 'bg-slate-800/30' : ''} hover:bg-slate-800/50 transition`}>
                  <td className="px-6 py-4">{row.spec}</td>
                  <td className="px-6 py-4 text-cyan-400 font-semibold">{row.value}</td>
                  <td className="px-6 py-4 text-gray-400">{row.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20 px-4 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          Seguridad y Confiabilidad
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-8 rounded-lg border border-cyan-500/30 bg-slate-800/50">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-cyan-400" />
              <h3 className="text-xl font-semibold">Encriptación de Datos</h3>
            </div>
            <p className="text-gray-400">
              Encriptación end-to-end con algoritmos AES-256 para todas las comunicaciones y almacenamiento de datos.
            </p>
          </div>

          <div className="p-8 rounded-lg border border-cyan-500/30 bg-slate-800/50">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-cyan-400" />
              <h3 className="text-xl font-semibold">Redundancia de Sistemas</h3>
            </div>
            <p className="text-gray-400">
              Arquitectura multi-nodo con failover automático para garantizar disponibilidad 99.9%.
            </p>
          </div>

          <div className="p-8 rounded-lg border border-cyan-500/30 bg-slate-800/50">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-cyan-400" />
              <h3 className="text-xl font-semibold">Auditorías de Seguridad</h3>
            </div>
            <p className="text-gray-400">
              Auditorías de seguridad regulares y pruebas de penetración por terceros independientes.
            </p>
          </div>

          <div className="p-8 rounded-lg border border-cyan-500/30 bg-slate-800/50">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-cyan-400" />
              <h3 className="text-xl font-semibold">Cumplimiento Normativo</h3>
            </div>
            <p className="text-gray-400">
              Certificación ISO 27001 y cumplimiento GDPR para protección de datos y privacidad.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="rounded-lg border border-cyan-500/30 bg-gradient-to-r from-slate-800/50 to-slate-800/30 p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Interesado en WarNet V4?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Contacta con nuestro equipo para obtener más información, demostraciones o acceso a la plataforma.
          </p>
          <button className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition transform hover:scale-105">
            Solicitar Información
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cyan-500/20 bg-slate-900/50 py-12 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-cyan-400" />
              <span className="font-bold">WarNet V4</span>
            </div>
            <p className="text-gray-400 text-sm">
              Control inteligente de dirigibles autónomos.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Producto</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-cyan-400 transition">Características</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition">Documentación</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition">Precios</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Empresa</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-cyan-400 transition">Acerca de</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition">Blog</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition">Contacto</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-cyan-400 transition">Privacidad</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition">Términos</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition">Seguridad</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-cyan-500/20 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2026 WarNet Command V4. Todos los derechos reservados.</p>
        </div>
      </footer>


    </div>
  );
};

export default LandingPage;
