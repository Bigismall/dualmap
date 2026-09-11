import 'leaflet-geosearch/dist/geosearch.css';
import 'leaflet/dist/leaflet.css';
import { Axis } from './Axis.class.ts';
import { WIDTH_25, WIDTH_33, WIDTH_50, WIDTH_66, WIDTH_100 } from './constants.ts';

import { osmLayers } from './layers.ts';
import { MapFactory } from './MapFactory.class.ts';
import './plugins/linearmeasurement/LinearMeasurement.css';
import { OsmFrame } from './Providers.ts';
import { SelectGroupClass } from './RadioGroup.class.ts';
import { Scene } from './Scene.class.ts';
import './styles/style.css';

import type { DOMElement, DOMElements, LayerName, MapType } from './types.ts';
import { getMapOptions, getUrlParams, setUrlParams } from './url.ts';
import { $, $$, getMissingElements, hasMissingElements } from './utils/dom.ts';

window.addEventListener('load', () => {
  const $elements: DOMElements = new Map<string, DOMElement>([
    ['osm', $('.js-osm')],
    ['map', $('.js-map')],
    ['overlay', $('.js-overlay')],
    ['layout', $('.js-layout')],
    ['mapTypeNav', $('.js-map-type')],
    ['overlayTypeNav', $('.js-overlay-type')],
    ['layerTypeNav', $('.js-layer-type')],
    ['proportionNav', $('.js-proportion')],
    ['axis', $$('.axis')],
  ]);

  if (hasMissingElements($elements)) {
    window.alert(`Some elements are missing: ${getMissingElements($elements)}`);
    return;
  }

  const urlParams = getUrlParams();
  const mapOptions = getMapOptions(urlParams);
  const mapType = urlParams.type;
  const mapWidth = urlParams.width;
  const overlayType = urlParams.overlay;
  const scene = new Scene();
  const axis = new Axis($elements.get('axis') as NodeListOf<HTMLElement>);
  let activeMap = MapFactory.create(mapType, $elements.get('map') as HTMLDivElement);

  const overlayMap = new OsmFrame($elements.get('overlay') as HTMLIFrameElement, mapOptions, {
    layer: urlParams.overlay,
    maxZoom: 19, //Default for DE
    frame: false,
    type: 'osm',
  });

  const osm = new OsmFrame($elements.get('osm') as HTMLIFrameElement, mapOptions, {
    layer: urlParams.layer,
    maxZoom: 19, //Default for DE
    frame: false,
    type: 'osm',
  });

  const $layout = $elements.get('layout') as HTMLElement;
  const $overlay = $elements.get('overlay') as HTMLElement;
  if (
    mapWidth === WIDTH_25 ||
    mapWidth === WIDTH_33 ||
    mapWidth === WIDTH_50 ||
    mapWidth === WIDTH_66 ||
    mapWidth === WIDTH_100
  ) {
    $layout.classList.add(mapWidth);
  } else {
    $layout.classList.add(WIDTH_50);
  }

  if (!overlayMap) {
    $overlay.classList.add('hidden');
  }

  new ResizeObserver(() => {
    osm.getInstance().invalidateSize();
  }).observe(osm.$element);

  new SelectGroupClass($elements.get('mapTypeNav') as HTMLElement, mapType, (event) => {
    const mapType = (event.target as HTMLSelectElement).value;

    osm.unsubscribe(activeMap);
    activeMap.destroy();
    activeMap = MapFactory.create(mapType as MapType, $elements.get('map') as HTMLDivElement);
    osm.subscribe(activeMap);
    activeMap.render();
    setUrlParams(activeMap.mapOptions, osm.getLayer(), mapType as MapType, mapWidth, overlayType, urlParams.sq);
  });

  new SelectGroupClass($elements.get('layerTypeNav') as HTMLElement, urlParams.layer, (event) => {
    const mapLayer = (event.target as HTMLSelectElement).value as LayerName;

    if (osm.getInstance().hasLayer(osmLayers[osm.getLayer()][0])) {
      osm.switchLayerTo(mapLayer);
    }
  });

  new SelectGroupClass($elements.get('proportionNav') as HTMLElement, mapWidth, (event) => {
    const proportion = (event.target as HTMLSelectElement).value;
    const $layout = $elements.get('layout') as HTMLElement;
    const currentMapType = activeMap.config.type as MapType;

    $layout.classList.remove(WIDTH_25, WIDTH_33, WIDTH_50, WIDTH_66, WIDTH_100);
    $layout.classList.add(proportion);

    osm.unsubscribe(activeMap);
    activeMap.destroy();

    if (proportion !== WIDTH_100) {
      activeMap = MapFactory.create(currentMapType as MapType, $elements.get('map') as HTMLDivElement);
      osm.subscribe(activeMap);
      // osm.publish({
      //   state: MessageState.Reload,
      // });
      activeMap.render();
    }

    setUrlParams(activeMap.mapOptions, osm.getLayer(), currentMapType, proportion, overlayType, urlParams.sq);
  });

  if (overlayMap) {
    osm.subscribe(overlayMap);
    overlayMap.render();
  }

  osm.subscribe(activeMap);

  scene.subscribe(osm);
  scene.subscribe(axis);
  activeMap.render();
});
