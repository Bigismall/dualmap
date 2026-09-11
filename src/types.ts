export type MapType = 'google' | 'streetview' | 'osm' | 'bing' | 'adsb' | 'osmb' | 'waze' | 'ump';
export type LayerName =
  | 'OSM'
  | 'OSM DE'
  | 'Humanitarian'
  | 'Topography'
  | 'Cyclo'
  | 'Satellite'
  | 'Rail'
  | 'Lidar'
  | ''; //DEFAULT_OVERLAY

// Create array based on the MapType
const mapTypeArray: MapType[] = ['google', 'streetview', 'bing', 'adsb', 'osmb', 'waze', 'ump'];

const layerNameArray: LayerName[] = [
  'OSM',
  'OSM DE',
  'Humanitarian',
  'Topography',
  'Cyclo',
  'Satellite',
  'Rail',
  'Lidar',
];

export const isLayerName = (value: string): value is LayerName => layerNameArray.includes(value as LayerName);
export const isMapType = (value: string): value is MapType => mapTypeArray.includes(value as MapType);

export type MapOptions = {
  lat: number;
  lng: number;
  zoom: number;
};

export type SquareBounds = [[number, number], [number, number]];

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
  overlay: LayerName;
  width: string;
  sq?: SquareBounds;
};

export enum MessageState {
  MoveMap = 'MoveMap', //Same as resize
  KeyPressed = 'KeyPressed',
  Reload = 'Reload',
}

export type Message =
  | {
      state: MessageState.KeyPressed;
      data: {
        key: string;
      };
    }
  | {
      state: MessageState.MoveMap;
      data: MapOptions;
    }
  | {
      state: MessageState.Reload;
    };

export type DOMElement = Element | NodeListOf<HTMLElement> | null;
export type DOMElements = Map<string, DOMElement>;
export type RadioItemAction = (event: Event) => void;

export interface Observer {
  update: (publication: Message) => void;
}

export interface Publisher {
  subscribers: Observer[];
  subscribe: (callback: Observer) => void;
  publish: (publication: Message) => void;
}
