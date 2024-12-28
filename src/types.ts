export type MapType = 'wiki' | 'google' | 'streetview' | 'osm' | 'bing' | 'adsb' | 'osmb';
export type LayerName = 'OSM' | 'OSM DE' | 'Humanitarian' | 'Topography' | 'Cyclo' | 'Satellite' | 'Rail';

// Create array based on the MapType
const mapTypeArray: MapType[] = ['wiki', 'google', 'streetview', 'osm', 'bing', 'adsb', 'osmb'];
const layerNameArray: LayerName[] = ['OSM', 'OSM DE', 'Humanitarian', 'Topography', 'Cyclo', 'Satellite', 'Rail'];

export const isLayerName = (value: string): value is LayerName => layerNameArray.includes(value as LayerName);
export const isMapType = (value: string): value is MapType => mapTypeArray.includes(value as MapType);

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
  width: string;
};

export enum MessageState {
  MoveMap = 'MoveMap', //Same as resize
  KeyPressed = 'KeyPressed',
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
