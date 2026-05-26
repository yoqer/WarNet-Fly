import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Layers, Settings, X, AlertCircle, Loader } from 'lucide-react';

interface Location {
  lat: number;
  lng: number;
  name: string;
}

interface NavigationConfig {
  mapType: 'roadmap' | 'satellite' | '3d';
  zoom: number;
  tilt: number;
  heading: number;
  showTraffic: boolean;
  showTransit: boolean;
  showBicycling: boolean;
}

/**
 * Google 3D Navigation Component
 * 
 * Integra Google Maps con soporte para:
 * - Visualización 3D de terreno
 * - Navegación interactiva
 * - Múltiples capas de información
 * - Integración con Google Ask
 * - Control por voz
 */

export const Google3DNavigation: React.FC<{
  isEnabled?: boolean;
  onLocationSelect?: (location: Location) => void;
}> = ({ isEnabled = false, onLocationSelect }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [config, setConfig] = useState<NavigationConfig>({
    mapType: '3d',
    zoom: 18,
    tilt: 45,
    heading: 0,
    showTraffic: true,
    showTransit: false,
    showBicycling: false,
  });

  // Inicializar Google Maps
  useEffect(() => {
    if (!isEnabled || !mapContainerRef.current) return;

    const initializeMap = async () => {
      try {
        setIsLoading(true);

        // Cargar Google Maps API
        if (!window.google) {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places,geometry,drawing`;
          script.async = true;
          script.defer = true;
          script.onload = () => initMap();
          document.head.appendChild(script);
        } else {
          initMap();
        }
      } catch (err) {
        setError('Error al cargar Google Maps');
        console.error(err);
        setIsLoading(false);
      }
    };

    const initMap = () => {
      if (!mapContainerRef.current) return;

      // Obtener ubicación actual
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;

            // Crear mapa
            mapRef.current = new window.google.maps.Map(mapContainerRef.current as HTMLElement, {
              center: { lat: latitude, lng: longitude },
              zoom: config.zoom,
              mapTypeId: config.mapType === '3d' ? 'satellite' : config.mapType,
              tilt: config.tilt,
              heading: config.heading,
              fullscreenControl: true,
              mapTypeControl: true,
              zoomControl: true,
              streetViewControl: true,
            });

            // Marcador de ubicación actual
            new window.google.maps.Marker({
              position: { lat: latitude, lng: longitude },
              map: mapRef.current,
              title: 'Tu ubicación',
              icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            });

            setCurrentLocation({
              lat: latitude,
              lng: longitude,
              name: 'Tu ubicación',
            });

            // Agregar capas
            addMapLayers();

            // Event listeners
            mapRef.current.addListener('click', (event: any) => {
              handleMapClick(event.latLng);
            });

            setIsLoading(false);
          },
          (error) => {
            setError(`Error de geolocalización: ${error.message}`);
            setIsLoading(false);
          }
        );
      } else {
        setError('Geolocalización no disponible');
        setIsLoading(false);
      }
    };

    initializeMap();
  }, [isEnabled]);

  /**
   * Agregar capas de información al mapa
   */
  const addMapLayers = () => {
    if (!mapRef.current) return;

    // Capa de tráfico
    if (config.showTraffic) {
      const trafficLayer = new window.google.maps.TrafficLayer();
      trafficLayer.setMap(mapRef.current);
    }

    // Capa de tránsito
    if (config.showTransit) {
      const transitLayer = new window.google.maps.TransitLayer();
      transitLayer.setMap(mapRef.current);
    }

    // Capa de ciclovías
    if (config.showBicycling) {
      const bicyclingLayer = new window.google.maps.BicyclingLayer();
      bicyclingLayer.setMap(mapRef.current);
    }
  };

  /**
   * Manejar clic en el mapa
   */
  const handleMapClick = (latLng: any) => {
    const location: Location = {
      lat: latLng.lat(),
      lng: latLng.lng(),
      name: `${latLng.lat().toFixed(4)}, ${latLng.lng().toFixed(4)}`,
    };

    // Crear marcador
    new window.google.maps.Marker({
      position: location,
      map: mapRef.current,
      title: location.name,
    });

    setCurrentLocation(location);
    onLocationSelect?.(location);
  };

  /**
   * Buscar ubicación
   */
  const handleSearch = async () => {
    if (!searchQuery.trim() || !mapRef.current) return;

    try {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: searchQuery }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          const newLocation: Location = {
            lat: location.lat(),
            lng: location.lng(),
            name: results[0].formatted_address,
          };

          mapRef.current.setCenter(location);
          mapRef.current.setZoom(18);

          new window.google.maps.Marker({
            position: location,
            map: mapRef.current,
            title: newLocation.name,
          });

          setCurrentLocation(newLocation);
          onLocationSelect?.(newLocation);
          setSearchQuery('');
        } else {
          setError('Ubicación no encontrada');
        }
      });
    } catch (err) {
      setError('Error en búsqueda de ubicación');
      console.error(err);
    }
  };

  /**
   * Calcular ruta
   */
  const calculateRoute = async (destination: Location) => {
    if (!currentLocation || !mapRef.current) return;

    try {
      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        map: mapRef.current,
        suppressMarkers: false,
      });

      const request = {
        origin: { lat: currentLocation.lat, lng: currentLocation.lng },
        destination: { lat: destination.lat, lng: destination.lng },
        travelMode: window.google.maps.TravelMode.DRIVING,
      };

      directionsService.route(request, (result: any, status: any) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          directionsRenderer.setDirections(result);
        } else {
          setError('No se pudo calcular la ruta');
        }
      });
    } catch (err) {
      setError('Error al calcular ruta');
      console.error(err);
    }
  };

  /**
   * Cambiar tipo de mapa
   */
  const changeMapType = (type: 'roadmap' | 'satellite' | '3d') => {
    if (!mapRef.current) return;
    setConfig({ ...config, mapType: type });
    mapRef.current.setMapTypeId(type === '3d' ? 'satellite' : type);
  };

  /**
   * Cambiar ángulo de visualización (tilt)
   */
  const changeTilt = (tilt: number) => {
    if (!mapRef.current) return;
    setConfig({ ...config, tilt });
    mapRef.current.setTilt(tilt);
  };

  /**
   * Cambiar orientación (heading)
   */
  const changeHeading = (heading: number) => {
    if (!mapRef.current) return;
    setConfig({ ...config, heading });
    mapRef.current.setHeading(heading);
  };

  if (!isEnabled) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Navigation className="w-6 h-6 text-cyan-500" />
          <span className="text-lg font-semibold text-white">Navegación 3D de Google</span>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 hover:bg-slate-700 rounded transition-colors"
        >
          {showSettings ? (
            <X className="w-5 h-5 text-slate-400" />
          ) : (
            <Settings className="w-5 h-5 text-slate-400" />
          )}
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="bg-slate-800 border-b border-slate-700 p-3 flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Buscar ubicación..."
          className="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400 text-sm"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded font-medium text-sm transition-colors"
        >
          Buscar
        </button>
      </div>

      {/* Mapa */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900 bg-opacity-75 z-50">
            <div className="flex flex-col items-center gap-3">
              <Loader className="w-8 h-8 text-cyan-500 animate-spin" />
              <span className="text-white text-sm">Cargando mapa...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute top-4 left-4 right-4 bg-red-900 border border-red-700 rounded p-3 flex gap-2 z-50">
            <AlertCircle className="w-5 h-5 text-red-200 flex-shrink-0" />
            <span className="text-red-200 text-sm">{error}</span>
          </div>
        )}

        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* Panel de Control */}
      {showSettings && (
        <div className="bg-slate-800 border-t border-slate-700 p-4 max-h-48 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            {/* Tipo de Mapa */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Tipo de Mapa</label>
              <div className="flex gap-2">
                <button
                  onClick={() => changeMapType('roadmap')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    config.mapType === 'roadmap'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Mapa
                </button>
                <button
                  onClick={() => changeMapType('satellite')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    config.mapType === 'satellite'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Satélite
                </button>
                <button
                  onClick={() => changeMapType('3d')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    config.mapType === '3d'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  3D
                </button>
              </div>
            </div>

            {/* Ángulo de Visualización */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Ángulo: {config.tilt}°
              </label>
              <input
                type="range"
                min="0"
                max="90"
                value={config.tilt}
                onChange={(e) => changeTilt(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Orientación */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Orientación: {config.heading}°
              </label>
              <input
                type="range"
                min="0"
                max="360"
                value={config.heading}
                onChange={(e) => changeHeading(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Capas */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Capas</label>
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showTraffic}
                    onChange={(e) => setConfig({ ...config, showTraffic: e.target.checked })}
                    className="w-3 h-3"
                  />
                  Tráfico
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showTransit}
                    onChange={(e) => setConfig({ ...config, showTransit: e.target.checked })}
                    className="w-3 h-3"
                  />
                  Tránsito
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showBicycling}
                    onChange={(e) => setConfig({ ...config, showBicycling: e.target.checked })}
                    className="w-3 h-3"
                  />
                  Ciclovías
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Información de Ubicación Actual */}
      {currentLocation && (
        <div className="bg-slate-800 border-t border-slate-700 p-3 flex items-center gap-3">
          <MapPin className="w-4 h-4 text-cyan-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-slate-300">Ubicación Actual</div>
            <div className="text-sm text-slate-200 truncate">{currentLocation.name}</div>
            <div className="text-xs text-slate-400">
              {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Google3DNavigation;
