'use client';

import { useEffect, useRef } from 'react';

interface MapViewProps {
  latitude?: number;
  longitude?: number;
  title?: string;
  zoom?: number;
  height?: string;
  markers?: Array<{
    lat: number;
    lng: number;
    label?: string;
    color?: string;
  }>;
}

export function MapView({
  latitude = 4.7110,
  longitude = -74.0055,
  title,
  zoom = 15,
  height = 'h-96',
  markers = [],
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current || typeof window === 'undefined' || !window.google) {
      return;
    }

    // Crear mapa
    googleMapRef.current = new google.maps.Map(mapRef.current, {
      center: { lat: latitude, lng: longitude },
      zoom,
      styles: [
        {
          featureType: 'all',
          elementType: 'geometry',
          stylers: [{ saturation: -100 }],
        },
      ],
      mapTypeControl: true,
      fullscreenControl: true,
      streetViewControl: false,
    });

    // Limpiar marcadores previos
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Agregar marcador principal
    if (latitude && longitude) {
      const mainMarker = new google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: googleMapRef.current,
        title: title || 'Ubicación',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#ea580c',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });

      if (title) {
        new google.maps.InfoWindow({
          content: `<div class="p-2"><strong>${title}</strong></div>`,
        }).open(googleMapRef.current, mainMarker);
      }

      markersRef.current.push(mainMarker);
    }

    // Agregar marcadores adicionales
    markers.forEach((marker) => {
      const customMarker = new google.maps.Marker({
        position: { lat: marker.lat, lng: marker.lng },
        map: googleMapRef.current!,
        title: marker.label,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: marker.color || '#ea580c',
          fillOpacity: 0.7,
          strokeColor: '#ffffff',
          strokeWeight: 1.5,
        },
      });

      if (marker.label) {
        new google.maps.InfoWindow({
          content: `<div class="p-2"><strong>${marker.label}</strong></div>`,
        }).open(googleMapRef.current, customMarker);
      }

      markersRef.current.push(customMarker);
    });

    // Ajustar zoom si hay múltiples marcadores
    if (markersRef.current.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      markersRef.current.forEach((marker) => {
        bounds.extend(marker.getPosition()!);
      });
      googleMapRef.current.fitBounds(bounds);
    }

    return () => {
      // Limpiar al desmontar
      markersRef.current.forEach((marker) => marker.setMap(null));
    };
  }, [latitude, longitude, title, zoom, markers]);

  return (
    <div
      ref={mapRef}
      className={`w-full ${height} rounded-lg border border-slate-300 shadow-sm`}
    />
  );
}
