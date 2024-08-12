import { KEY_GOOGLE_MAPS, KEY_WIKIMAPIA, LayerName } from './constants.ts';

export type MapOptions = {
  lat: number;
  lng: number;
  zoom: number;
};

export type MapConfig = {
  key?: string;
  apiKey?: string;
  layer?: LayerName;
  maxZoom: number;
  off: boolean;
};

export type OffParameter = typeof KEY_GOOGLE_MAPS | typeof KEY_WIKIMAPIA;
