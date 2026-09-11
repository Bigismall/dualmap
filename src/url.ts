import {
  DEFAULT_CENTER,
  DEFAULT_LAYER,
  DEFAULT_MAP_TYPE,
  DEFAULT_OVERLAY,
  DEFAULT_ZOOM,
  MAX_ZOOM,
  WIDTH_50,
} from './constants';
import {
  isLayerName,
  isMapType,
  type LayerName,
  type MapOptions,
  type MapType,
  type OverlayName,
  type UrlParams,
} from './types.ts';
import { log } from './utils/console.ts';
import { isEmptyString } from './utils/dom.ts';

const MIN_ZOOM = 0;
const EARTH_CIRCUMFERENCE_METERS = 40_075_016.686;
const GOOGLE_MAPS_CAMERA_FOV_DEGREES = 35;
const GOOGLE_MAPS_DEFAULT_VIEWPORT_HEIGHT = 900;
const FEET_TO_METERS = 0.3048;

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

const altitudeToZoom = (altitudeMeters: number, latitude: number): number => {
  if (!Number.isFinite(altitudeMeters) || altitudeMeters <= 0) {
    return DEFAULT_ZOOM;
  }

  const viewportHeight = Math.max(window.innerHeight || GOOGLE_MAPS_DEFAULT_VIEWPORT_HEIGHT, 1);
  const latitudeScale = Math.max(Math.cos((latitude * Math.PI) / 180), Number.EPSILON);
  const visibleGroundMeters = 2 * altitudeMeters * Math.tan((GOOGLE_MAPS_CAMERA_FOV_DEGREES * Math.PI) / 360);
  const metersPerPixel = visibleGroundMeters / viewportHeight;
  const zoom = Math.log2((latitudeScale * EARTH_CIRCUMFERENCE_METERS) / (256 * metersPerPixel));

  return normalizeZoom(zoom, DEFAULT_ZOOM);
};

type UrlParamsType = {
  options: MapOptions;
  layer: LayerName;
  type: MapType;
  width: string;
  overlay: OverlayName;
};

export const setUrlParams = ({ options, layer, type, width, overlay }: UrlParamsType) => {
  const url = new URL(window.location.href);
  url.searchParams.set('lat', options.lat.toString().slice(0, 12));
  url.searchParams.set('lng', options.lng.toString().slice(0, 12));
  url.searchParams.set('z', options.zoom.toString());
  url.searchParams.set('l', layer);
  url.searchParams.set('t', type);
  url.searchParams.set('w', width);

  if (isEmptyString(overlay)) {
    url.searchParams.delete('o');
  } else {
    url.searchParams.set('o', overlay);
  }

  window.history.replaceState({}, '', url.toString());
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
  const rawType = urlParams.get('t') ?? '';
  const type: MapType = isMapType(rawType) ? (rawType as MapType) : DEFAULT_MAP_TYPE;
  const overlay = isLayerName(urlParams.get('o') ?? '') ? (urlParams.get('o') as LayerName) : DEFAULT_OVERLAY;
  const width = urlParams.get('w') ?? WIDTH_50;

  return {
    lat,
    lng,
    zoom,
    layer,
    type,
    overlay,
    width,
  };
};

export const getMapOptions = (urlParams: UrlParams): MapOptions => ({
  zoom: urlParams.zoom,
  lat: urlParams.lat,
  lng: urlParams.lng,
});

//https://www.google.com/maps/@54.3735078,18.4736094,4008m/data=!3m1!1e3?entry=ttu&g_ep=EgoyMDI2MDcwOC4wIKXMDSoASAFQAw%3D%3D
export const parseGoogleMapsUrl = (url: string): MapOptions => {
  const googleMapsUrl = new URL(url);
  const coordinates = `${googleMapsUrl.pathname}${googleMapsUrl.search}${googleMapsUrl.hash}`.match(
    /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?),(\d+(?:\.\d+)?)(z|m|ft)/i,
  );

  if (!coordinates) {
    throw new Error('The provided URL is missing "@lat,lng,zoomz" or "@lat,lng,altitudem" coordinates.');
  }

  const lat = Number.parseFloat(coordinates[1]);
  const lng = Number.parseFloat(coordinates[2]);
  const parsedScale = Number.parseFloat(coordinates[3]);
  const unit = coordinates[4].toLowerCase();

  if (!isValidCoordinatePair(lat, lng)) {
    throw new Error('The provided URL contains invalid latitude or longitude values.');
  }

  const zoom =
    unit === 'z'
      ? normalizeZoom(parsedScale, DEFAULT_ZOOM)
      : altitudeToZoom(unit === 'ft' ? parsedScale * FEET_TO_METERS : parsedScale, lat);

  log({ lat, lng, zoom });
  return {
    lat,
    lng,
    zoom,
  };
};
