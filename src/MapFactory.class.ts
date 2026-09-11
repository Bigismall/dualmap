import { GOOGLE_MAPS_API_KEY, MAX_ZOOM } from './constants.ts';
import type { MapObserver } from './Map.class.ts';
import {
  ADSBExchangeFrame,
  BingMapsFrame,
  GoogleMapsFrame,
  GoogleStreetViewFrame,
  OpenStreetMapFrame,
  OSMBuildingsFrame,
  UMPFrame,
  WazeFrame,
} from './Providers.ts';
import type { MapType } from './types.ts';
import { getMapOptions, getUrlParams } from './url.ts';

// biome-ignore lint/complexity/noStaticOnlyClass: <It has to be static>
export class MapFactory {
  public static create = (type: MapType, $mapElement: HTMLDivElement): MapObserver => {
    const mapOptions = getMapOptions(getUrlParams());
    const mapConfig = {
      frame: true,
      maxZoom: MAX_ZOOM,
      type,
    };

    switch (type) {
      case 'google':
        return new GoogleMapsFrame($mapElement, mapOptions, { ...mapConfig, apiKey: GOOGLE_MAPS_API_KEY });
      case 'streetview':
        return new GoogleStreetViewFrame($mapElement, mapOptions, { ...mapConfig, apiKey: GOOGLE_MAPS_API_KEY });
      case 'osm':
        return new OpenStreetMapFrame($mapElement, mapOptions, mapConfig);
      case 'bing':
        return new BingMapsFrame($mapElement, mapOptions, mapConfig);
      case 'adsb':
        return new ADSBExchangeFrame($mapElement, mapOptions, mapConfig);
      case 'osmb':
        return new OSMBuildingsFrame($mapElement, mapOptions, mapConfig);
      case 'waze':
        return new WazeFrame($mapElement, mapOptions, mapConfig);
      case 'ump':
        return new UMPFrame($mapElement, mapOptions, mapConfig);
    }
    throw new Error(`Unsupported map type: ${type}`);
  };
}
