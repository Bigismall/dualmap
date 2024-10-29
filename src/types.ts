export type MapType = 'wiki' | 'google' | 'rail' | 'osm';
export type LayerName = 'OSM' | 'OSM DE' | 'Humanitarian' | 'Topography' | 'Cyclo' | 'Satellite' | 'Rail';

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

export type UrlParams = {
  lat: number;
  lng: number;
  zoom: number;
  layer: LayerName;
  type: MapType;
};

export type DOMElement = Element | NodeListOf<HTMLElement> | null;
export type DOMElements = Map<string, DOMElement>;
export type RadioItemAction = (event: Event) => void;

export const isLayerName = (value: string): value is LayerName =>
  ['OSM', 'OSM DE', 'Humanitarian', 'Topography', 'Cyclo', 'Satellite', 'Rail'].includes(value);

export const isMapType = (value: string): value is MapType => ['wiki', 'google', 'rail', 'osm'].includes(value);
