import { log } from './console';
import { DEFAULT_CENTER, DEFAULT_LAYER, DEFAULT_ZOOM, type LayerName, MAX_ZOOM } from './constants';
import { MapOptions, UrlParams } from './types.ts';

export const setUrlParams = (options: MapOptions, layer: LayerName) => {
  const url = new URL(window.location.href);
  url.searchParams.set('lat', options.lat.toString());
  url.searchParams.set('lng', options.lng.toString());
  url.searchParams.set('zoom', options.zoom.toString());
  url.searchParams.set('layer', layer);
  // url.searchParams.set('off', off.join(OFF_PARAMETER_SEPARATOR));
  window.history.pushState({}, '', url.toString());
};

export const getUrlParams = (): UrlParams | null => {
  const urlParams = new URLSearchParams(window.location.search);
  const lat = urlParams.get('lat');
  const lng = urlParams.get('lng');
  const zoom = Number.parseFloat(urlParams.get('zoom') ?? DEFAULT_ZOOM.toString());
  const layer = urlParams.get('layer') as LayerName | null;

  if (lat && lng) {
    return {
      lat: Number.parseFloat(lat),
      lng: Number.parseFloat(lng),
      zoom: zoom > MAX_ZOOM ? MAX_ZOOM : zoom,
      layer: layer ?? DEFAULT_LAYER,
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
