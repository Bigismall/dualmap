import { $, $$, hasMissingElements } from './utils/dom.ts';

import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';

import { MAX_ZOOM } from './constants.ts';
import './styles/style.css';
import { Axis } from './Axis.class.ts';
import { MapFactory, OsmFrame } from './Map.class.ts';
import { Scene } from './Scene.class.ts';
import { DOMElement, DOMElements, MapType } from './types.ts';
import { getMapOptions, getUrlParams, setUrlParams } from './url.ts';

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

  const urlParams = getUrlParams();
  const mapOptions = getMapOptions(urlParams);
  const mapType = urlParams.type;
  const scene = new Scene();
  const axis = new Axis($elements.get('axis') as NodeListOf<HTMLElement>);
  let activeMap = MapFactory.create(mapType, $elements.get('map') as HTMLDivElement);

  const osm = new OsmFrame($elements.get('osm') as HTMLIFrameElement, mapOptions, {
    layer: urlParams.layer,
    maxZoom: MAX_ZOOM,
    frame: false,
    type: 'osm',
  });

  new ResizeObserver(() => {
    osm.getInstance().invalidateSize();
  }).observe(osm.$element);

  Array.from($elements.get('mapType') as NodeListOf<HTMLInputElement>).map(($element) => {
    $element.checked = $element.value === mapType;

    $element.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      const layer = target.value as string;

      osm.unsubscribe(activeMap);
      activeMap.destroy();
      activeMap = MapFactory.create(layer as MapType, $elements.get('map') as HTMLDivElement);
      osm.subscribe(activeMap);
      activeMap.render();
      setUrlParams(activeMap.mapOptions, osm.getLayer(), layer as MapType);
    });
  });

  osm.subscribe(activeMap);
  scene.subscribe(osm);
  scene.subscribe(axis);
  activeMap.render();
});
