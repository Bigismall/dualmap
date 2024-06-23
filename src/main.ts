import { $, $$ } from './dom.ts';

import 'leaflet/dist/leaflet.css';
import {
  DEFAULT_CENTER,
  DEFAULT_LAYER,
  DEFAULT_ZOOM,
  GOOGLE_MAPS_API_KEY,
  KEY_GOOGLE_MAPS,
  KEY_WIKIMAPIA,
  MAX_ZOOM,
} from './constants.ts';
import './style.css';
import { Axis } from './Axis.class.ts';
import { GoogleMapsFrame, OsmFrame, WikiMapiaFrame } from './Map.class.ts';
import { Scene } from './Scene.class.ts';
import { log } from './console.ts';
import { MapOptions } from './types.ts';
import { checkUrlParams } from './url.ts';

// TODO - add biome lint, lint force

window.addEventListener('load', () => {
  const $elements = new Map<string, Element | NodeListOf<HTMLElement> | null>([
    // ['app', $('#app')],
    ['osm', $('.js-osm')],
    ['googlemaps', $('.js-googlemaps')],
    ['wikimapia', $('.js-wikimapia')],
    ['axis', $$('.axis')],
  ]);

  const $missingElements = Array.from($elements.values()).filter(($element) => $element === null);

  if ($missingElements.length > 0) {
    window.alert('Some elements are missing');
    $missingElements.map(log);
    return;
  }

  const urlParams = checkUrlParams();
  const mapOptions: MapOptions = urlParams
    ? {
        zoom: urlParams.zoom,
        lat: urlParams.lat,
        lng: urlParams.lng,
      }
    : {
        zoom: DEFAULT_ZOOM,
        lat: DEFAULT_CENTER[0],
        lng: DEFAULT_CENTER[1],
      };

  console.log('OFF params ', urlParams?.off);

  const axis = new Axis($elements.get('axis') as NodeListOf<HTMLElement>);

  const googleMaps = new GoogleMapsFrame($elements.get('googlemaps') as HTMLIFrameElement, mapOptions, {
    apiKey: GOOGLE_MAPS_API_KEY,
    key: KEY_GOOGLE_MAPS,
    maxZoom: MAX_ZOOM,
    off: urlParams?.off.includes(KEY_GOOGLE_MAPS) ?? false,
  });

  const wikiMapia = new WikiMapiaFrame($elements.get('wikimapia') as HTMLIFrameElement, mapOptions, {
    key: KEY_WIKIMAPIA,
    maxZoom: MAX_ZOOM,
    off: urlParams?.off.includes(KEY_WIKIMAPIA) ?? false,
  });

  const osm = new OsmFrame($elements.get('osm') as HTMLIFrameElement, mapOptions, {
    layer: urlParams?.layer ?? DEFAULT_LAYER,
    maxZoom: MAX_ZOOM,
    off: false,
  });

  const scene = new Scene();

  osm.subscribe(googleMaps);
  osm.subscribe(wikiMapia);

  scene.subscribe(googleMaps);
  scene.subscribe(wikiMapia);
  scene.subscribe(osm);
  scene.subscribe(axis);

  googleMaps.render();
  wikiMapia.render();

  new ResizeObserver(() => {
    osm.getInstance().invalidateSize();
  }).observe(osm.$element);
});
