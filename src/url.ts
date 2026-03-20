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

const COORDINATE_SEPARATOR_REGEX = /[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?/g;

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

const parseLegacySquareBounds = (value: string): SquareBounds | undefined => {
  const matches = value.match(COORDINATE_SEPARATOR_REGEX);
  if (!matches || matches.length !== 4) {
    return undefined;
  }

  const flatValues = matches.map((match) => Number.parseFloat(match));
  return parseSquareBoundsFromFlatValues(flatValues);
};

export const parseSquareBounds = (values: string[]): SquareBounds | undefined => {
  if (values.length === 0) {
    return undefined;
  }

  // Backward compatibility with old `sq=lat,lng;lat,lng` format.
  if (values.length === 1) {
    return parseLegacySquareBounds(values[0]);
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
      url.searchParams.append('sq', value.toString());
    });
  }
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
  const sq = parseSquareBounds(urlParams.getAll('sq')) ?? parseSquareBounds(urlParams.getAll('sq[]'));

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
