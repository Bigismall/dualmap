import { $, $$, hasMissingElements } from './utils/dom.ts';

import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';

import { DEFAULT_LAYER, GOOGLE_MAPS_API_KEY, MAX_ZOOM } from './constants.ts';
import './styles/style.css';
import { Axis } from './Axis.class.ts';
import { GoogleMapsFrame, MapObserver, OpenRailwayMapFrame, OsmFrame, WikiMapiaFrame } from './Map.class.ts';
import { Scene } from './Scene.class.ts';
import { DOMElement, DOMElements, MapType } from './types.ts';
import { getMapOptions, getUrlParams } from './url.ts';

window.addEventListener('load', () => {
  const $elements: DOMElements = new Map<string, DOMElement>([
    ['osm', $('.js-osm')],
    ['map', $('.js-map')],
    ['axis', $$('.axis')],
    ['mapType', $$('input[name="map-type"]')],
  ]);

  if (hasMissingElements($elements)) {
    window.alert('Some elements are missing');
    return;
  }

  const getActivateMap = (type: MapType) => {
    let currentMap: MapObserver;
    const mapOptions = getMapOptions(getUrlParams());
    const $mapElement = $elements.get('map') as HTMLDivElement;

    switch (type) {
      case 'google':
        currentMap = new GoogleMapsFrame($mapElement, mapOptions, {
          apiKey: GOOGLE_MAPS_API_KEY,
          maxZoom: MAX_ZOOM,
          frame: true,
          type: 'google',
        });
        break;
      case 'wiki':
        currentMap = new WikiMapiaFrame($mapElement, mapOptions, {
          maxZoom: MAX_ZOOM,
          frame: true,
          type: 'wiki',
        });
        break;
      case 'rail':
        currentMap = new OpenRailwayMapFrame($mapElement, mapOptions, {
          maxZoom: MAX_ZOOM,
          frame: true,
          type: 'rail',
        });
        break;
    }
    // @ts-ignore
    return currentMap;
  };

  const urlParams = getUrlParams();
  const mapOptions = getMapOptions(urlParams);

  const scene = new Scene();
  const axis = new Axis($elements.get('axis') as NodeListOf<HTMLElement>);
  let activeMap = getActivateMap('wiki');

  const osm = new OsmFrame($elements.get('osm') as HTMLIFrameElement, mapOptions, {
    layer: urlParams?.layer ?? DEFAULT_LAYER,
    maxZoom: MAX_ZOOM,
    frame: false,
    type: 'osm',
  });

  new ResizeObserver(() => {
    osm.getInstance().invalidateSize();
  }).observe(osm.$element);

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
});
