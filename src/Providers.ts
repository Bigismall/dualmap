import L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import { KEY_IMPORT_URL, MAX_ZOOM, measureOptions } from './constants.ts';
import { osmLayers } from './layers.ts';
import { MapObserver, MapPublisherObserver } from './Map.class.ts';

// @ts-expect-error
import { LinearMeasurement } from './plugins/linearmeasurement/LinearMeasurement.js';
import {
  type LayerName,
  type MapConfig,
  type MapOptions,
  type Message,
  MessageState,
  type SquareBounds,
} from './types.ts';
import { getUrlParams, parseGoogleMapsUrl, setUrlParams } from './url.ts';
import { log } from './utils/console.ts';
import { rootFontSize } from './utils/dom.ts';

export class GoogleMapsFrame extends MapObserver {
  public getUrl() {
    return `https://www.google.com/maps/embed/v1/view?key=${this.config.apiKey}&center=${this.mapOptions.lat},${this.mapOptions.lng}&zoom=${this.mapOptions.zoom}&maptype=satellite`;
  }
}

// Google street view embed
export class GoogleStreetViewFrame extends MapObserver {
  public getUrl() {
    return `https://www.google.com/maps/embed/v1/streetview?key=${this.config.apiKey}&location=${this.mapOptions.lat},${this.mapOptions.lng}&heading=0`;
  }
}

//OSM Buildings frame
export class OSMBuildingsFrame extends MapObserver {
  public getUrl() {
    return `https://dualmaps.eu/osmbuildings/?lat=${this.mapOptions.lat}&lon=${this.mapOptions.lng}&zoom=${this.mapOptions.zoom}&tilt=30&rotation=0`;
  }
}

export class WazeFrame extends MapObserver {
  getUrl() {
    return `https://embed.waze.com/en/iframe?zoom=${this.mapOptions.zoom}&lat=${this.mapOptions.lat}&lon=${this.mapOptions.lng}`;
  }
}

export class UMPFrame extends MapObserver {
  getUrl() {
    return `https://mapa.ump.waw.pl/ump-www/?zoom=${this.mapOptions.zoom}&lat=${this.mapOptions.lat}&lon=${this.mapOptions.lng}&layers=B0FFFFFFF`;
  }
}

export class BingMapsFrame extends MapObserver {
  getUrl() {
    const width = window.innerWidth / 2;
    const height = window.innerHeight - 2 * rootFontSize; //-2rem
    return `https://www.bing.com/maps/embed?h=${height}&w=${width}&cp=${this.mapOptions.lat}~${this.mapOptions.lng}&lvl=${this.mapOptions.zoom}&typ=MapType`;
  }
}

export class ADSBExchangeFrame extends MapObserver {
  getUrl() {
    return `https://globe.airplanes.live/?hideSidebar&lat=${this.mapOptions.lat}&lon=${this.mapOptions.lng}&zoom=${this.mapOptions.zoom}&hideSidebar&enableLabels&extendedLabels=2`;
  }
}

export class OsmFrame extends MapPublisherObserver {
  private readonly squareBounds?: SquareBounds;
  private squareRectangle: L.Rectangle | null = null;
  private readonly instance: L.Map;
  private currentLayer: LayerName;

  constructor(
    public $element: HTMLIFrameElement,
    public mapOptions: MapOptions,
    public config: MapConfig,
  ) {
    super($element, mapOptions, config);
    this.currentLayer = this.config.layer as LayerName;
    this.instance = L.map($element as HTMLDivElement, {
      center: [this.mapOptions.lat, this.mapOptions.lng],
      zoom: this.mapOptions.zoom,
      layers: [...osmLayers[this.currentLayer]],
      maxZoom: this.config.maxZoom,
    });
    const provider = new OpenStreetMapProvider();
    // @ts-expect-error
    const search: L.Control = new GeoSearchControl({ provider: provider }) as L.Control;
    const measurement: L.Control = new LinearMeasurement(measureOptions) as L.Control;

    this.instance.addControl(search);
    this.instance.addControl(measurement);
    this.instance.on('moveend', this.updatePosition);

    const { sq } = getUrlParams();
    this.squareBounds = sq;
    this.renderSquareOverlay();
  }

  private updatePosition = () => {
    this.publish({
      state: MessageState.MoveMap,
      data: this.getMapOptions(),
    });
    const { type, width, sq } = getUrlParams();

    setUrlParams(this.getMapOptions(), this.currentLayer, type, width, sq);
  };

  private renderSquareOverlay = () => {
    if (!this.squareBounds) {
      return;
    }

    if (this.squareRectangle && this.instance.hasLayer(this.squareRectangle)) {
      this.instance.removeLayer(this.squareRectangle);
    }

    this.squareRectangle = L.rectangle(this.squareBounds, {
      color: '#f97316',
      weight: 2,
      fillOpacity: 0.5,
      interactive: false,
    }).addTo(this.instance);
  };

  update(publication: Message) {
    log('Publication:', publication, 'Observer: OSM');

    if (publication.state === MessageState.KeyPressed) {
      if (publication.data.key.toLowerCase() === KEY_IMPORT_URL) {
        const url = prompt('Enter Google Maps URL');
        if (url) {
          this.setMapOptions(parseGoogleMapsUrl(url));
        }
      }
    }
  }

  getUrl = () => '';

  getInstance() {
    return this.instance;
  }

  getLayer() {
    return this.currentLayer;
  }

  switchLayerTo(layer: LayerName) {
    this.instance.eachLayer((layer) => {
      this.instance.removeLayer(layer);
    });

    const newLayers = osmLayers[layer];

    newLayers.forEach((layer) => {
      this.instance.addLayer(layer);
    });

    const maxZoom = Math.min(...newLayers.map((l) => l.options.maxZoom ?? MAX_ZOOM));
    this.instance.setMaxZoom(maxZoom);

    if (this.instance.getZoom() > maxZoom) {
      this.instance.setZoom(maxZoom);
    }

    this.currentLayer = layer;

    this.renderSquareOverlay();

    const { type, width, sq } = getUrlParams();
    setUrlParams(this.getMapOptions(), layer, type, width, sq);
  }

  getMapOptions = (): MapOptions => ({
    lat: this.instance.getCenter().lat,
    lng: this.instance.getCenter().lng,
    zoom: this.instance.getZoom(),
  });

  setMapOptions = (options: MapOptions) => {
    this.instance.setView([options.lat, options.lng], options.zoom);
    this.updatePosition();
  };
}
