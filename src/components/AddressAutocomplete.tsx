'use client';

import { useState, useRef, useEffect } from 'react';
import { geocodeAddress, GeocodeResult } from '@/lib/maps';
import toast from 'react-hot-toast';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelected?: (address: GeocodeResult) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function AddressAutocomplete({
  value,
  onChange,
  onAddressSelected,
  placeholder = 'Ingresa la dirección...',
  disabled = false,
}: AddressAutocompleteProps) {
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Inicializar servicios de Google Maps
  useEffect(() => {
    if (typeof window !== 'undefined' && window.google) {
      autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
      
      // Crear un dummy div para PlacesService (necesita un map)
      const mapDiv = document.createElement('div');
      mapDiv.style.display = 'none';
      document.body.appendChild(mapDiv);
      const map = new google.maps.Map(mapDiv);
      placesServiceRef.current = new google.maps.places.PlacesService(map);
    }
  }, []);

  // Manejar input changes y obtener predicciones
  const handleInputChange = async (text: string) => {
    onChange(text);

    if (text.length < 3) {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }

    if (!autocompleteServiceRef.current) {
      console.error('Autocomplete service not initialized');
      return;
    }

    setIsLoading(true);
    try {
      const request = {
        input: text,
        // Restrict to Colombia, but also include Latin America for flexibility
        componentRestrictions: { country: 'co' },
      };

      const predictions = await autocompleteServiceRef.current.getPlacePredictions(request);
      setPredictions(predictions.predictions || []);
      setShowPredictions(true);
    } catch (error) {
      console.error('Autocomplete error:', error);
      toast.error('Error obteniendo sugerencias de direcciones');
    } finally {
      setIsLoading(false);
    }
  };

  // Seleccionar una predicción
  const handleSelectPrediction = async (prediction: google.maps.places.AutocompletePrediction) => {
    const description = prediction.description;
    onChange(description);
    setShowPredictions(false);
    setPredictions([]);

    // Geocodificar la dirección seleccionada
    setIsLoading(true);
    try {
      const result = await geocodeAddress(description);
      if (result && onAddressSelected) {
        onAddressSelected(result);
        toast.success('Dirección validada correctamente');
      } else {
        toast.error('No se pudo validar la dirección');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast.error('Error al validar la dirección');
    } finally {
      setIsLoading(false);
    }
  };

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (divRef.current && !divRef.current.contains(event.target as Node)) {
        setShowPredictions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manejar Enter key para seleccionar la primera predicción
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && predictions.length > 0) {
      e.preventDefault();
      handleSelectPrediction(predictions[0]);
    }
    if (e.key === 'Escape') {
      setShowPredictions(false);
    }
  };

  return (
    <div ref={divRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || isLoading}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
      />

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute right-3 top-2.5">
          <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Predictions dropdown */}
      {showPredictions && predictions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
          {predictions.map((prediction, index) => (
            <button
              key={prediction.place_id || index}
              onClick={() => handleSelectPrediction(prediction)}
              className="w-full text-left px-4 py-2 hover:bg-orange-50 border-b border-slate-100 last:border-b-0 transition-colors"
              type="button"
            >
              <div className="font-medium text-slate-900">
                {prediction.structured_formatting?.main_text || prediction.description}
              </div>
              <div className="text-sm text-slate-500">
                {prediction.structured_formatting?.secondary_text ||
                  prediction.description.split(',').slice(1).join(',').trim()}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showPredictions && value.length >= 3 && predictions.length === 0 && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg z-10 p-3 text-center text-slate-500">
          No se encontraron direcciones
        </div>
      )}

      {/* Hint text */}
      <p className="text-xs text-slate-500 mt-1">
        Escribe al menos 3 caracteres para ver sugerencias de direcciones
      </p>
    </div>
  );
}
