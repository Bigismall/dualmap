import { $, $$, getMissingElements, hasMissingElements } from './utils/dom.ts';

import 'leaflet-geosearch/dist/geosearch.css';
import 'leaflet/dist/leaflet.css';
import './plugins/linearmeasurement/LinearMeasurement.css';

import { Axis } from './Axis.class.ts';
import { MapFactory } from './MapFactory.class.ts';
import { OsmFrame } from './Providers.ts';
import { RadioGroupClass } from './RadioGroup.class.ts';
import { Scene } from './Scene.class.ts';
import { MAX_ZOOM, WIDTH_100, WIDTH_50, WIDTH_66 } from './constants.ts';
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
    ['about', $('#about')],
    ['close-about', $('#close-about')],
  ]);

  if (hasMissingElements($elements)) {
    window.alert('Some elements are missing:' + getMissingElements($elements));
    return;
  }

  const urlParams = getUrlParams();
  const mapOptions = getMapOptions(urlParams);
  const mapType = urlParams.type;
  const mapWidth = urlParams.width;
  const scene = new Scene();
  const axis = new Axis($elements.get('axis') as NodeListOf<HTMLElement>);
  let activeMap = MapFactory.create(mapType, $elements.get('map') as HTMLDivElement);

  const osm = new OsmFrame($elements.get('osm') as HTMLIFrameElement, mapOptions, {
    layer: urlParams.layer,
    maxZoom: MAX_ZOOM,
    frame: false,
    type: 'osm',
  });

  const $layout = $elements.get('layout') as HTMLElement;
  if (mapWidth === WIDTH_50 || mapWidth === WIDTH_66 || mapWidth === WIDTH_100) {
    $layout.classList.add(mapWidth);
  } else {
    $layout.classList.add(WIDTH_50);
  }
  setUrlParams(activeMap.mapOptions, osm.getLayer(), mapType, WIDTH_50);

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
    setUrlParams(activeMap.mapOptions, osm.getLayer(), mapType as MapType, mapWidth);
  });

  new RadioGroupClass($elements.get('layerTypeNav') as HTMLElement, urlParams.layer, (event) => {
    const mapLayer = (event.target as HTMLInputElement).value as LayerName;

    if (osm.getInstance().hasLayer(osmLayers[osm.getLayer()][0])) {
      osm.switchLayerTo(mapLayer);
    }
  });

  new RadioGroupClass($elements.get('proportionNav') as HTMLElement, mapWidth, (event) => {
    const oldProportion = mapWidth;
    const proportion = (event.target as HTMLInputElement).value;
    const $layout = $elements.get('layout') as HTMLElement;

    // Remove existing width classes and add new one if not using w100 option
    $layout.classList.remove(WIDTH_50, WIDTH_66, WIDTH_100);
    $layout.classList.add(proportion);

    //FIXME - fix maptype when changing the proportion

    // Handle right map display and left map sizing
    if (proportion === WIDTH_100) {
      osm.unsubscribe(activeMap);
      activeMap.destroy();
    } else {
      osm.unsubscribe(activeMap);
      activeMap.destroy();
      activeMap = MapFactory.create(mapType as MapType, $elements.get('map') as HTMLDivElement);
      osm.subscribe(activeMap);
      activeMap.render();
    }

    setUrlParams(activeMap.mapOptions, osm.getLayer(), mapType, proportion);
  });

  // FIXME - move to Scene
  ($elements.get('close-about') as HTMLButtonElement).addEventListener('click', () => {
    ($elements.get('about') as HTMLInputElement).checked = false;
  });

  osm.subscribe(activeMap);
  scene.subscribe(osm);
  scene.subscribe(axis);
  activeMap.render();
});
