import 'leaflet-geosearch/dist/geosearch.css';
import 'leaflet/dist/leaflet.css';
import { Axis } from './Axis.class.ts';
import { WIDTH_25, WIDTH_33, WIDTH_50, WIDTH_66, WIDTH_100 } from './constants.ts';

import { osmLayers } from './layers.ts';
import { MapFactory } from './MapFactory.class.ts';
import './plugins/linearmeasurement/LinearMeasurement.css';
import { OsmFrame, OsmOverlay } from './Providers.ts';
import { SelectGroupClass } from './RadioGroup.class.ts';
import { Scene } from './Scene.class.ts';
import './styles/style.css';

import type { DOMElement, DOMElements, LayerName, MapType } from './types.ts';
import { getMapOptions, getUrlParams, setUrlParams } from './url.ts';
import { $, $$, getMissingElements, hasMissingElements } from './utils/dom.ts';

window.addEventListener('load', () => {
  const $elements: DOMElements = new Map<string, DOMElement>([
    ['document', document.documentElement],
    ['osm', $('.js-osm')],
    ['map', $('.js-map')],
    ['overlay', $('.js-overlay')],
    ['layout', $('.js-layout')],
    ['mapTypeNav', $('.js-map-type')],
    ['overlayTypeNav', $('.js-overlay-type')],
    ['layerTypeNav', $('.js-layer-type')],
    ['proportionNav', $('.js-proportion')],
    ['opacityNav', $('.js-opacity')],
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
  const scene = new Scene();
  const axis = new Axis($elements.get('axis') as NodeListOf<HTMLElement>);
  let activeMap = MapFactory.create(mapType, $elements.get('map') as HTMLDivElement);

  const osm = new OsmFrame($elements.get('osm') as HTMLIFrameElement, mapOptions, {
    layer: urlParams.layer,
    maxZoom: 19, //Default for DE
    frame: false,
    type: 'osm',
  });

  const overlayMap = new OsmOverlay($elements.get('overlay') as HTMLIFrameElement, mapOptions, {
    layer: urlParams.overlay,
    maxZoom: 19, //Default for DE
    frame: false,
    type: 'osm',
  });

  const $layout = $elements.get('layout') as HTMLElement;
  const $overlay = $elements.get('overlay') as HTMLElement;
  if ([WIDTH_25, WIDTH_33, WIDTH_50, WIDTH_66, WIDTH_100].includes(mapWidth)) {
    $layout.classList.add(mapWidth);
  } else {
    $layout.classList.add(WIDTH_50);
  }

  if (!overlayMap.getInstance()) {
    $overlay.classList.add('hidden');
  }

  new ResizeObserver(() => {
    osm.getInstance().invalidateSize();
    overlayMap.getInstance()?.invalidateSize();
  }).observe(osm.$element);

  new SelectGroupClass($elements.get('mapTypeNav') as HTMLSelectElement, mapType, (event) => {
    const mapType = (event.target as HTMLSelectElement).value;

    osm.unsubscribe(activeMap);
    activeMap.destroy();
    activeMap = MapFactory.create(mapType as MapType, $elements.get('map') as HTMLDivElement);
    osm.subscribe(activeMap);
    activeMap.render();
    setUrlParams({
      options: activeMap.mapOptions,
      layer: osm.getLayer(),
      type: mapType as MapType,
      width: getUrlParams().width,
      overlay: getUrlParams().overlay,
    });
  });

  new SelectGroupClass($elements.get('layerTypeNav') as HTMLSelectElement, urlParams.layer, (event) => {
    const mapLayer = (event.target as HTMLSelectElement).value as LayerName;

    if (osm.getInstance().hasLayer(osmLayers[osm.getLayer()][0])) {
      osm.switchLayerTo(mapLayer);
    }
  });
  // Select group for overlay

  new SelectGroupClass($elements.get('overlayTypeNav') as HTMLSelectElement, urlParams.overlay, (event) => {
    const mapLayer = (event.target as HTMLSelectElement).value as LayerName;

    if (overlayMap.getInstance() === null) {
      $overlay.classList.remove('hidden');
      overlayMap.init(mapLayer);
    } else {
      if (overlayMap.getInstance()?.hasLayer(osmLayers[overlayMap.getLayer()][0])) {
        overlayMap.switchLayerTo(mapLayer);
      }
    }
  });

  new SelectGroupClass($elements.get('proportionNav') as HTMLSelectElement, mapWidth, (event) => {
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
      activeMap.render();
    }

    setUrlParams({
      options: activeMap.mapOptions,
      layer: osm.getLayer(),
      type: currentMapType,
      width: proportion,
      overlay: urlParams.overlay,
    });
  });

  new SelectGroupClass($elements.get('opacityNav') as HTMLSelectElement, '50', (event) => {
    const opacity = (event.target as HTMLSelectElement).value;
    ($elements.get('document') as HTMLHtmlElement).style.setProperty(
      '--overlay-opacity',
      (parseInt(opacity, 10) / 100).toFixed(2),
    );
  });

  osm.subscribe(activeMap);
  osm.subscribe(overlayMap);

  scene.subscribe(osm);
  scene.subscribe(axis);
  activeMap.render();
});
