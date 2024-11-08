import { $, $$, hasMissingElements } from './utils/dom.ts';

import 'leaflet-geosearch/dist/geosearch.css';
import 'leaflet/dist/leaflet.css';

import { Axis } from './Axis.class.ts';
import { MapFactory } from './MapFactory.class.ts';
import { OsmFrame } from './Providers.ts';
import { RadioGroupClass } from './RadioGroup.class.ts';
import { Scene } from './Scene.class.ts';
import { MAX_ZOOM } from './constants.ts';
import { osmLayers } from './layers.ts';
import './styles/style.css';
import { DOMElement, DOMElements, LayerName, MapType } from './types.ts';
import { getMapOptions, getUrlParams, setUrlParams } from './url.ts';

window.addEventListener('load', () => {
  const $elements: DOMElements = new Map<string, DOMElement>([
    ['osm', $('.js-osm')],
    ['map', $('.js-map')],
    ['layout', $('.js-layout')],
    ['mapTypeNav', $('.js-map-type')],
    ['layerTypeNav', $('.js-layer-type')],
    ['proportionNav', $('.js-proportion')],
    ['axis', $$('.axis')],
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

  new RadioGroupClass($elements.get('mapTypeNav') as HTMLElement, mapType, (event) => {
    const mapType = (event.target as HTMLInputElement).value as string;

    osm.unsubscribe(activeMap);
    activeMap.destroy();
    activeMap = MapFactory.create(mapType as MapType, $elements.get('map') as HTMLDivElement);
    osm.subscribe(activeMap);
    activeMap.render();
    setUrlParams(activeMap.mapOptions, osm.getLayer(), mapType as MapType);
  });

  new RadioGroupClass($elements.get('layerTypeNav') as HTMLElement, urlParams.layer, (event) => {
    const mapLayer = (event.target as HTMLInputElement).value as LayerName;

    if (osm.getInstance().hasLayer(osmLayers[osm.getLayer()][0])) {
      osm.switchLayerTo(mapLayer);
    }
  });

  new RadioGroupClass($elements.get('proportionNav') as HTMLElement, 'w50', (event) => {
    const proportion = (event.target as HTMLInputElement).value;
    const $layout = $elements.get('layout') as HTMLElement;
    $layout.classList.remove('w50', 'w66');
    $layout.classList.add(proportion);
  });

  osm.subscribe(activeMap);
  scene.subscribe(osm);
  scene.subscribe(axis);
  activeMap.render();
});
