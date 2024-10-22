import { $, $$ } from './dom.ts';

import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';

import { DEFAULT_CENTER, DEFAULT_LAYER, DEFAULT_ZOOM, GOOGLE_MAPS_API_KEY, MAX_ZOOM } from './constants.ts';
import './style.css';
import { Axis } from './Axis.class.ts';
import { GoogleMapsFrame, MapObserver, OpenRailwayMapFrame, OsmFrame, WikiMapiaFrame } from './Map.class.ts';
import { Scene } from './Scene.class.ts';
import { log } from './console.ts';
import { MapOptions, MapType } from './types.ts';
import { getUrlParams } from './url.ts';

window.addEventListener('load', () => {
  const $elements = new Map<string, Element | NodeListOf<HTMLElement> | null>([
    // ['app', $('#app')],
    ['osm', $('.js-osm')],
    ['map', $('.js-map')],
    ['axis', $$('.axis')],
    ['mapType', $$('input[name="map-type"]')],
  ]);

  //TODO OPENRAILWAYMAP has padding that needs to be removed

  const $missingElements = Array.from($elements.values()).filter(($element) => $element === null);

  if ($missingElements.length > 0) {
    window.alert('Some elements are missing');
    $missingElements.map(log);
    return;
  }

  const getActivateMap = (type: MapType) => {
    let currentMap: MapObserver;

    //FIXME: USe factory pattern
    switch (type) {
      case 'google':
        currentMap = new GoogleMapsFrame($elements.get('map') as HTMLDivElement, mapOptions, {
          apiKey: GOOGLE_MAPS_API_KEY,
          maxZoom: MAX_ZOOM,
          frame: true,
        });

        break;
      case 'wiki':
        currentMap = new WikiMapiaFrame($elements.get('map') as HTMLDivElement, mapOptions, {
          maxZoom: MAX_ZOOM,
          frame: true,
        });
        break;
      case 'rail':
        currentMap = new OpenRailwayMapFrame($elements.get('map') as HTMLDivElement, mapOptions, {
          maxZoom: MAX_ZOOM,
          frame: true,
        });
        break;
    }
    return currentMap;
  };

  const urlParams = getUrlParams();
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

  const axis = new Axis($elements.get('axis') as NodeListOf<HTMLElement>);
  let activeMap = getActivateMap('wiki');

  const osm = new OsmFrame($elements.get('osm') as HTMLIFrameElement, mapOptions, {
    layer: urlParams?.layer ?? DEFAULT_LAYER,
    maxZoom: MAX_ZOOM,
    frame: false,
  });

  const scene = new Scene();

  ($elements.get('mapType') as NodeListOf<HTMLInputElement>)?.forEach(($element) => {
    $element.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      const layer = target.value as string;
      osm.unsubscribe(activeMap);
      activeMap.destroy();
      activeMap = getActivateMap(layer as MapType);
      osm.subscribe(activeMap);
      activeMap.render();
    });
  });

  osm.subscribe(activeMap);

  scene.subscribe(osm);
  scene.subscribe(axis);

  activeMap.render();

  new ResizeObserver(() => {
    osm.getInstance().invalidateSize();
  }).observe(osm.$element);
});
