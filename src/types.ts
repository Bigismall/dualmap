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
  type: MapType;
};

export type MapType = 'wiki' | 'google' | 'rail' | 'osm';

export type UrlParams = {
  lat: number;
  lng: number;
  zoom: number;
  layer: LayerName;
};

export type DOMElement = Element | NodeListOf<HTMLElement> | null;
export type DOMElements = Map<string, DOMElement>;
