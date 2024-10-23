import { LayerName } from './constants.ts';

export type MapOptions = {
  lat: number;
  lng: number;
  zoom: number;
};

export type MapConfig = {
  apiKey?: string;
  layer?: LayerName;
  maxZoom: number;
  frame: boolean;
};

export type MapType = 'wiki' | 'google' | 'rail';

export type UrlParams = {
  lat: number;
  lng: number;
  zoom: number;
  layer: LayerName;
};
