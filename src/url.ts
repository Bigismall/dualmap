import { DEFAULT_CENTER, DEFAULT_LAYER, DEFAULT_MAP_TYPE, DEFAULT_ZOOM, MAX_ZOOM, WIDTH_50 } from './constants';
import { isLayerName, isMapType, type LayerName, type MapOptions, type MapType, type UrlParams } from './types.ts';
import { log } from './utils/console.ts';

export const setUrlParams = (options: MapOptions, layer: LayerName, type: MapType, width: string) => {
  const url = new URL(window.location.href);
  url.searchParams.set('lat', options.lat.toString().slice(0, 12));
  url.searchParams.set('lng', options.lng.toString().slice(0, 12));
  url.searchParams.set('z', options.zoom.toString());
  url.searchParams.set('l', layer);
  url.searchParams.set('t', type);
  url.searchParams.set('w', width);
  window.history.pushState({}, '', url.toString());
};

export const getUrlParams = (): UrlParams => {
  const urlParams = new URLSearchParams(window.location.search);
  const lat = Number.parseFloat(urlParams.get('lat') ?? DEFAULT_CENTER[0].toString());
  const lng = Number.parseFloat(urlParams.get('lng') ?? DEFAULT_CENTER[1].toString());
  const zoom = Math.min(Number.parseFloat(urlParams.get('z') ?? DEFAULT_ZOOM.toString()), MAX_ZOOM);
  const layer = isLayerName(urlParams.get('l') ?? '') ? (urlParams.get('l') as LayerName) : DEFAULT_LAYER;
  const type = isMapType(urlParams.get('t') ?? '') ? (urlParams.get('t') as MapType) : DEFAULT_MAP_TYPE;
  const width = urlParams.get('w') ?? WIDTH_50;

  return {
    lat,
    lng,
    zoom,
    layer,
    type,
    width,
  };
};

export const getMapOptions = (urlParams: UrlParams): MapOptions => ({
  zoom: urlParams.zoom,
  lat: urlParams.lat,
  lng: urlParams.lng,
});

export const parseGoogleMapsUrl = (url: string): MapOptions => {
  const googleMapsUrl = new URL(url);
  const params = googleMapsUrl.pathname.split('@')[1].split(',');
  const lat = Number.parseFloat(params[0]);
  const lng = Number.parseFloat(params[1]);
  const zoom = Number.parseInt(params[2].replace(/[^0-9.]*/, ''), 10);

  log({ lat, lng, zoom });
  return {
    lat,
    lng,
    zoom,
  };
};
