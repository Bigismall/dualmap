import { MapObserver } from './Map.class.ts';
import {
  ADSBExchangeFrame,
  BingMapsFrame,
  GoogleMapsFrame,
  GoogleStreetViewFrame,
  WikiMapiaFrame,
} from './Providers.ts';
import { GOOGLE_MAPS_API_KEY, MAX_ZOOM } from './constants.ts';
import { MapType } from './types.ts';
import { getMapOptions, getUrlParams } from './url.ts';

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
      case 'wiki':
        return new WikiMapiaFrame($mapElement, mapOptions, mapConfig);
      case 'bing':
        return new BingMapsFrame($mapElement, mapOptions, mapConfig);
      case 'adsb':
        return new ADSBExchangeFrame($mapElement, mapOptions, mapConfig);
    }
    // @ts-ignore
    return null;
  };
}
