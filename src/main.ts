import { $, $$ } from './dom.ts';

import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';

import { DEFAULT_CENTER, DEFAULT_LAYER, DEFAULT_ZOOM, MAX_ZOOM } from './constants.ts';
import './style.css';
import { Axis } from './Axis.class.ts';
import { OsmFrame, WikiMapiaFrame } from './Map.class.ts';
import { Scene } from './Scene.class.ts';
import { log } from './console.ts';
import { MapOptions } from './types.ts';
import { checkUrlParams } from './url.ts';

window.addEventListener('load', () => {
  const $elements = new Map<string, Element | NodeListOf<HTMLElement> | null>([
    // ['app', $('#app')],
    ['osm', $('.js-osm')],
    ['map', $('.js-map')],
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

  // const googleMaps = new GoogleMapsFrame($elements.get('googlemaps') as HTMLIFrameElement, mapOptions, {
  //   apiKey: GOOGLE_MAPS_API_KEY,
  //   maxZoom: MAX_ZOOM,
  // });

  const wiki = new WikiMapiaFrame($elements.get('map') as HTMLDivElement, mapOptions, {
    maxZoom: MAX_ZOOM,
    frame: true,
  });

  const osm = new OsmFrame($elements.get('osm') as HTMLIFrameElement, mapOptions, {
    layer: urlParams?.layer ?? DEFAULT_LAYER,
    maxZoom: MAX_ZOOM,
    frame: false,
  });

  const scene = new Scene();

  // osm.subscribe(googleMaps);
  osm.subscribe(wiki);

  // scene.subscribe(googleMaps);
  // scene.subscribe(wiki);   Nothing to do with scene
  scene.subscribe(osm);
  scene.subscribe(axis);

  // googleMaps.render();
  wiki.render();

  new ResizeObserver(() => {
    osm.getInstance().invalidateSize();
  }).observe(osm.$element);
});
