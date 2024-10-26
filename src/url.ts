import { DEFAULT_CENTER, DEFAULT_LAYER, DEFAULT_MAP_TYPE, DEFAULT_ZOOM, MAX_ZOOM } from './constants';
import { LayerName, MapOptions, MapType, UrlParams, isLayerName, isMapType } from './types.ts';
import { log } from './utils/console.ts';

export const setUrlParams = (options: MapOptions, layer: LayerName, type: MapType) => {
  const url = new URL(window.location.href);
  url.searchParams.set('lat', options.lat.toString().slice(0, 12));
  url.searchParams.set('lng', options.lng.toString().slice(0, 12));
  url.searchParams.set('z', options.zoom.toString());
  url.searchParams.set('l', layer);
  url.searchParams.set('t', type);

  window.history.pushState({}, '', url.toString());
};

export const getUrlParams = (): UrlParams | null => {
  const urlParams = new URLSearchParams(window.location.search);
  const lat = urlParams.get('lat');
  const lng = urlParams.get('lng');
  const zoom = Number.parseFloat(urlParams.get('z') ?? DEFAULT_ZOOM.toString());
  const layer = isLayerName(urlParams.get('l') ?? '') ? (urlParams.get('l') as LayerName) : DEFAULT_LAYER;
  const type = isMapType(urlParams.get('t') ?? '') ? (urlParams.get('t') as MapType) : DEFAULT_MAP_TYPE;

  if (lat && lng) {
    return {
      lat: Number.parseFloat(lat),
      lng: Number.parseFloat(lng),
      zoom: zoom > MAX_ZOOM ? MAX_ZOOM : zoom,
      layer: layer,
      type: type,
    };
  }
  return null;
};

export const getMapOptions = (urlParams: UrlParams | null): MapOptions =>
  urlParams
    ? {
        zoom: urlParams.zoom,
        lat: urlParams.lat,
        lng: urlParams.lng,
      }
    : {
        zoom: DEFAULT_ZOOM,
        lat: DEFAULT_CENTER[0],
        lng: DEFAULT_CENTER[1],
      };

// https://www.google.com/maps/@54.3854942,18.3370827,15.95z?entry=ttu
export const parseGoogleMapsUrl = (url: string): MapOptions => {
  const googleMapsUrl = new URL(url);
  const params = googleMapsUrl.pathname.split('@')[1].split(',');
  const lat = Number.parseFloat(params[0]);
  const lng = Number.parseFloat(params[1]);
  const zoom = Number.parseInt(params[2].replace(/[^0-9.]*/, ''));

  log({ lat, lng, zoom });
  return {
    lat,
    lng,
    zoom,
  };
};
