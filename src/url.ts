import { log } from './console';
import { DEFAULT_LAYER, DEFAULT_ZOOM, type LayerName, MAX_ZOOM } from './constants';

export const setUrlParams = (latlong: L.LatLng, zoom: number, layer: LayerName) => {
  const url = new URL(window.location.href);
  url.searchParams.set('lat', latlong.lat.toString());
  url.searchParams.set('lon', latlong.lng.toString());
  url.searchParams.set('zoom', zoom.toString());
  url.searchParams.set('layer', layer);
  window.history.pushState({}, '', url.toString());
};

export const checkUrlParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const lat = urlParams.get('lat');
  const lon = urlParams.get('lon');
  const zoom = Number.parseFloat(urlParams.get('zoom') ?? DEFAULT_ZOOM.toString());
  const layer = urlParams.get('layer') as LayerName | null;
  if (lat && lon) {
    return {
      lat: Number.parseFloat(lat),
      lon: Number.parseFloat(lon),
      zoom: zoom > MAX_ZOOM ? MAX_ZOOM : zoom,
      layer: layer ?? DEFAULT_LAYER,
    };
  }
  return null;
};

// https://www.google.com/maps/@54.3854942,18.3370827,15.95z?entry=ttu
export const parseGoogleMapsUrl = (url: string): { lat: number; lon: number; zoom: number } => {
  const googleMapsUrl = new URL(url);
  const params = googleMapsUrl.pathname.split('@')[1].split(',');
  const lat = Number.parseFloat(params[0]);
  const lon = Number.parseFloat(params[1]);
  const zoom = Number.parseInt(params[2].replace(/[^0-9.]*/, ''));

  log({ lat, lon, zoom });
  return {
    lat: lat,
    lon: lon,
    zoom: zoom,
  };
};
