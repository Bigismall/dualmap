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

type SquareParamKey = 'lat1' | 'lng1' | 'lat2' | 'lng2';

const SQUARE_PARAM_KEYS: SquareParamKey[] = ['lat1', 'lng1', 'lat2', 'lng2'];

const isSquareParamKey = (value: string): value is SquareParamKey =>
  SQUARE_PARAM_KEYS.includes(value as SquareParamKey);

const parseSquareBoundsFromNamedValues = (
  namedValues: Partial<Record<SquareParamKey, number>>,
): SquareBounds | undefined => {
  const lat1 = namedValues.lat1;
  const lng1 = namedValues.lng1;
  const lat2 = namedValues.lat2;
  const lng2 = namedValues.lng2;
  if (lat1 === undefined || lng1 === undefined || lat2 === undefined || lng2 === undefined) {
    return undefined;
  }

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

  const namedValues: Partial<Record<SquareParamKey, number>> = {};
  for (const value of values) {
    const [rawKey, rawCoordinate] = value.split(/[:=]/, 2).map((item) => item.trim());
    if (!rawKey || !rawCoordinate || !isSquareParamKey(rawKey)) {
      return undefined;
    }

    const coordinate = Number.parseFloat(rawCoordinate);
    if (!Number.isFinite(coordinate) || namedValues[rawKey] !== undefined) {
      return undefined;
    }

    namedValues[rawKey] = coordinate;
  }

  return parseSquareBoundsFromNamedValues(namedValues);
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
    const namedValues: Record<SquareParamKey, number> = {
      lat1: sq[0][0],
      lng1: sq[0][1],
      lat2: sq[1][0],
      lng2: sq[1][1],
    };
    SQUARE_PARAM_KEYS.forEach((key) => {
      url.searchParams.append('sq[]', `${key}=${namedValues[key]}`);
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
