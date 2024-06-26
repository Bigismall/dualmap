import { LayerName } from './constants.ts';

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
};
