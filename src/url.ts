import { DEFAULT_CENTER, DEFAULT_LAYER, DEFAULT_MAP_TYPE, DEFAULT_ZOOM, MAX_ZOOM, WIDTH_50 } from './constants';
import {
  isLayerName,
  isMapType,
  type LayerName,
  type MapOptions,
  type MapType,
  type SquareBounds,
  type UrlParams,
} from './types.ts';
import { log } from './utils/console.ts';

const isValidCoordinatePair = (lat: number, lng: number): boolean =>
  Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

const parseSquareBoundsFromFlatValues = (flatValues: number[]): SquareBounds | undefined => {
  if (flatValues.length !== 4) {
    return undefined;
  }

  const [lat1, lng1, lat2, lng2] = flatValues;
  if (!isValidCoordinatePair(lat1, lng1) || !isValidCoordinatePair(lat2, lng2)) {
    return undefined;
  }

  return [
    [lat1, lng1],
    [lat2, lng2],
  ];
};

export const parseSquareBounds = (values: string[]): SquareBounds | undefined => {
  if (values.length !== 4) {
    return undefined;
  }

  const flatValues = values.map((value) => Number.parseFloat(value));
  if (flatValues.some((value) => !Number.isFinite(value))) {
    return undefined;
  }

  return parseSquareBoundsFromFlatValues(flatValues);
};

export const setUrlParams = (
  options: MapOptions,
  layer: LayerName,
  type: MapType,
  width: string,
  sq?: SquareBounds,
) => {
  const url = new URL(window.location.href);
  url.searchParams.set('lat', options.lat.toString().slice(0, 12));
  url.searchParams.set('lng', options.lng.toString().slice(0, 12));
  url.searchParams.set('z', options.zoom.toString());
  url.searchParams.set('l', layer);
  url.searchParams.set('t', type);
  url.searchParams.set('w', width);

  url.searchParams.delete('sq');
  url.searchParams.delete('sq[]');
  if (sq) {
    const flatValues = [sq[0][0], sq[0][1], sq[1][0], sq[1][1]];
    flatValues.forEach((value) => {
      url.searchParams.append('sq[]', value.toString());
    });
  }
  window.history.replaceState({}, '', url.toString());
};

export const getUrlParams = (): UrlParams => {
  const urlParams = new URLSearchParams(window.location.search);
  const lat = Number.parseFloat(urlParams.get('lat') ?? DEFAULT_CENTER[0].toString());
  const lng = Number.parseFloat(urlParams.get('lng') ?? DEFAULT_CENTER[1].toString());
  const zoom = Math.min(Number.parseFloat(urlParams.get('z') ?? DEFAULT_ZOOM.toString()), MAX_ZOOM);
  const layer = isLayerName(urlParams.get('l') ?? '') ? (urlParams.get('l') as LayerName) : DEFAULT_LAYER;
  const rawType = urlParams.get('t') ?? '';
  const type: MapType = isMapType(rawType) && rawType !== 'osm' ? (rawType as MapType) : DEFAULT_MAP_TYPE;
  const width = urlParams.get('w') ?? WIDTH_50;
  const sq = parseSquareBounds(urlParams.getAll('sq[]'));

  return {
    lat,
    lng,
    zoom,
    layer,
    type,
    width,
    sq,
  };
};

export const getMapOptions = (urlParams: UrlParams): MapOptions => ({
  zoom: urlParams.zoom,
  lat: urlParams.lat,
  lng: urlParams.lng,
});

export const parseGoogleMapsUrl = (url: string): MapOptions | null => {
  try {
    const googleMapsUrl = new URL(url);
    const atSegment = googleMapsUrl.pathname.split('@')[1];
    if (!atSegment) return null;
    const params = atSegment.split(',');
    if (params.length < 3) return null;
    const lat = Number.parseFloat(params[0]);
    const lng = Number.parseFloat(params[1]);
    const zoom = Number.parseInt(params[2].replace(/[^0-9.]*/, ''), 10);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(zoom)) return null;

    log({ lat, lng, zoom });
    return { lat, lng, zoom };
  } catch {
    return null;
  }
};
