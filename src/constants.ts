import type { LayerName, MapType } from './types.ts';

export const DEFAULT_CENTER: [number, number] = [52.464377026, 18.929443359];
export const DEFAULT_ZOOM: number = 8;
export const MAX_ZOOM: number = 20;
if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
  throw new Error('Missing environment variable: VITE_GOOGLE_MAPS_API_KEY. Please set it in your environment.');
}
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
export const DEFAULT_LAYER: LayerName = 'OSM DE';
export const DEFAULT_MAP_TYPE: MapType = 'google';
export const KEY_AXIS = '1';
export const KEY_IMPORT_URL = '2';
export const HIDDEN_CLASS = 'hidden';
export const WIDTH_50 = 'w50';
export const WIDTH_66 = 'w66';
export const WIDTH_100 = 'w100';

export const measureOptions = {
  unitSystem: 'metric',
  color: '#3381ff',
  type: 'line',
};
