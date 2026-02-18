import crypto from 'crypto';

/**
 * Interface para respuesta de Google Geocoding API
 */
export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  streetNumber?: string;
  streetName?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

/**
 * Geocodificar una dirección usando Google Maps API
 * @param address - Dirección a geocodificar
 * @returns Objeto con lat/lng y dirección formateada
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.searchParams.append('address', address);
    url.searchParams.append('key', apiKey);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.error('Geocoding error:', data.status);
      return null;
    }

    const result = data.results[0];
    const location = result.geometry.location;

    // Extraer componentes de la dirección
    const components: Record<string, string> = {};
    result.address_components.forEach((component: any) => {
      if (component.types.includes('street_number')) {
        components.streetNumber = component.long_name;
      }
      if (component.types.includes('route')) {
        components.streetName = component.long_name;
      }
      if (component.types.includes('locality')) {
        components.city = component.long_name;
      }
      if (component.types.includes('administrative_area_level_1')) {
        components.state = component.short_name;
      }
      if (component.types.includes('postal_code')) {
        components.postalCode = component.long_name;
      }
      if (component.types.includes('country')) {
        components.country = component.long_name;
      }
    });

    return {
      latitude: location.lat,
      longitude: location.lng,
      formattedAddress: result.formatted_address,
      ...components,
    };
  } catch (error) {
    console.error('Geocoding failed:', error);
    return null;
  }
}

/**
 * Reverse geocoding: convertir lat/lng a dirección usando Google Maps API
 * @param latitude - Latitud
 * @param longitude - Longitud
 * @returns Dirección formateada
 */
export async function reverseGeocodeCoordinates(
  latitude: number,
  longitude: number
): Promise<string | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.searchParams.append('latlng', `${latitude},${longitude}`);
    url.searchParams.append('key', apiKey);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      return null;
    }

    return data.results[0].formatted_address;
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return null;
  }
}

/**
 * Calcular distancia en km entre dos puntos usando fórmula Haversine
 * @param lat1 - Latitud punto 1
 * @param lon1 - Longitud punto 1
 * @param lat2 - Latitud punto 2
 * @param lon2 - Longitud punto 2
 * @returns Distancia en km
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10; // Redondear a 1 decimal
}

/**
 * Firmar URL usando Google Maps API signing secret
 * Para mayor seguridad y aumentar límite de requests diarios sin firma
 * @param unsignedUrl - URL sin firmar
 * @returns URL firmada
 */
export function signUrl(unsignedUrl: string): string {
  const secret = process.env.GOOGLE_MAPS_API_SECRET;
  if (!secret) {
    return unsignedUrl; // Retornar sin firmar si no hay secreto
  }

  try {
    // Extraer path y query de la URL
    const url = new URL(unsignedUrl);
    const urlPath = url.pathname + url.search;

    // Decodificar secreto (está en base64)
    const secretKey = Buffer.from(secret, 'base64');

    // Firmar usando HMAC-SHA1
    const signature = crypto
      .createHmac('sha1', secretKey)
      .update(urlPath)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    // Agregar firma a la URL
    url.searchParams.append('signature', signature);
    return url.toString();
  } catch (error) {
    console.error('URL signing failed:', error);
    return unsignedUrl;
  }
}

/**
 * Validar que las coordenadas sean válidas
 * @param latitude - Latitud
 * @param longitude - Longitud
 * @returns true si son válidas
 */
export function isValidCoordinates(latitude: number, longitude: number): boolean {
  return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}

/**
 * Formatear dirección para mostrar
 * @param address - Objeto con componentes de dirección
 * @returns String formateado
 */
export function formatAddressForDisplay(address: {
  streetNumber?: string;
  streetName?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}): string {
  const parts = [];

  if (address.streetNumber && address.streetName) {
    parts.push(`${address.streetNumber} ${address.streetName}`);
  } else if (address.streetName) {
    parts.push(address.streetName);
  }

  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.postalCode) parts.push(address.postalCode);

  return parts.join(', ');
}
