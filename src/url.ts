import { log } from './console';
import { DEFAULT_LAYER, DEFAULT_ZOOM, type LayerName, MAX_ZOOM, OFF_PARAMETER_SEPARATOR } from './constants';
import { MapOptions } from './types.ts';

export const setUrlParams = (options: MapOptions, layer: LayerName) => {
  const url = new URL(window.location.href);
  url.searchParams.set('lat', options.lat.toString());
  url.searchParams.set('lng', options.lng.toString());
  url.searchParams.set('zoom', options.zoom.toString());
  url.searchParams.set('layer', layer);
  // url.searchParams.set('off', off.join(OFF_PARAMETER_SEPARATOR));
  window.history.pushState({}, '', url.toString());
};

export const checkUrlParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const lat = urlParams.get('lat');
  const lng = urlParams.get('lng');
  const zoom = Number.parseFloat(urlParams.get('zoom') ?? DEFAULT_ZOOM.toString());
  const layer = urlParams.get('layer') as LayerName | null;
  const off = urlParams.get('off');

  console.log(off);
  if (lat && lng) {
    return {
      lat: Number.parseFloat(lat),
      lng: Number.parseFloat(lng),
      zoom: zoom > MAX_ZOOM ? MAX_ZOOM : zoom,
      layer: layer ?? DEFAULT_LAYER,
      off: off?.split(OFF_PARAMETER_SEPARATOR) ?? [],
    };
  }
  return null;
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
