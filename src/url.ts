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

const MIN_ZOOM = 0;

const isValidCoordinatePair = (lat: number, lng: number): boolean =>
  Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

const isValidLatitude = (value: number): boolean => Number.isFinite(value) && value >= -90 && value <= 90;

const isValidLongitude = (value: number): boolean => Number.isFinite(value) && value >= -180 && value <= 180;

const normalizeZoom = (value: number, fallback: number): number => {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(Math.max(value, MIN_ZOOM), MAX_ZOOM);
};

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
  window.history.pushState({}, '', url.toString());
};

export const getUrlParams = (): UrlParams => {
  const urlParams = new URLSearchParams(window.location.search);
  const parsedLat = Number.parseFloat(urlParams.get('lat') ?? '');
  const parsedLng = Number.parseFloat(urlParams.get('lng') ?? '');
  const parsedZoom = Number.parseFloat(urlParams.get('z') ?? '');
  const lat = isValidLatitude(parsedLat) ? parsedLat : DEFAULT_CENTER[0];
  const lng = isValidLongitude(parsedLng) ? parsedLng : DEFAULT_CENTER[1];
  const zoom = normalizeZoom(parsedZoom, DEFAULT_ZOOM);
  const layer = isLayerName(urlParams.get('l') ?? '') ? (urlParams.get('l') as LayerName) : DEFAULT_LAYER;
  const type = isMapType(urlParams.get('t') ?? '') ? (urlParams.get('t') as MapType) : DEFAULT_MAP_TYPE;
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

export const parseGoogleMapsUrl = (url: string): MapOptions => {
  const googleMapsUrl = new URL(url);
  const coordinates = `${googleMapsUrl.pathname}${googleMapsUrl.search}${googleMapsUrl.hash}`.match(
    /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?),(\d+(?:\.\d+)?)z/i,
  );

  if (!coordinates) {
    throw new Error('The provided URL is missing "@lat,lng,zoomz" coordinates.');
  }

  const lat = Number.parseFloat(coordinates[1]);
  const lng = Number.parseFloat(coordinates[2]);
  const parsedZoom = Number.parseFloat(coordinates[3]);

  if (!isValidCoordinatePair(lat, lng)) {
    throw new Error('The provided URL contains invalid latitude or longitude values.');
  }

  const zoom = normalizeZoom(parsedZoom, DEFAULT_ZOOM);

  log({ lat, lng, zoom });
  return {
    lat,
    lng,
    zoom,
  };
};
