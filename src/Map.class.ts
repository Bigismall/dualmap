import L from 'leaflet';
import { Message, MessageState } from './Message.type.ts';
import { Observer } from './Observer.interface.ts';
import { Publisher } from './Publisher.interface.ts';
import { DEFAULT_LAYER, GOOGLE_MAPS_API_KEY, LayerName, MAX_ZOOM } from './constants';
import { osmLayers } from './layers.ts';
import { MapConfig, MapOptions } from './types';
import { setUrlParams } from './url.ts';

// add abstract for show hide

abstract class MapFrame {
  protected constructor(
    public $element: HTMLIFrameElement,
    public mapOptions: MapOptions,
    public config: MapConfig,
  ) {
    this.$parent = $element.parentElement;
  }

  public $parent: HTMLElement | null = null;

  abstract getUrl(): string;
  public render(): void {
    this.$element.src = this.getUrl();
  }
  public toggle(): void {
    this.$parent?.classList.toggle('hidden');
  }

  public setOptions(options: MapOptions): void {
    this.mapOptions = { ...options };
  }
}

class MapObserver extends MapFrame implements Observer {
  constructor(
    public $element: HTMLIFrameElement,
    public mapOptions: MapOptions,
    public config: MapConfig,
  ) {
    super($element, mapOptions, config);
  }

  getUrl(): string {
    throw new Error('Method not implemented.');
  }

  public update(publication: Message) {
    console.log('Publication [Observer]', publication);
    if (publication.state === MessageState.MoveMap) {
      this.setOptions(publication.data);
      this.render();
    }
  }
}

class MapPublisher extends MapFrame implements Publisher {
  constructor(
    public $element: HTMLIFrameElement,
    public mapOptions: MapOptions,
    public config: MapConfig,
  ) {
    super($element, mapOptions, config);
  }

  public subscribers: Observer[] = [];

  getUrl(): string {
    throw new Error('Method not implemented.');
  }

  subscribe(callback: Observer) {
    this.subscribers.push(callback);
  }

  publish(publication: Message) {
    this.subscribers.map((s) => {
      s.update(publication);
      return s;
    });
  }
}

export class GoogleMapsFrame extends MapObserver {
  public getUrl() {
    return `https://www.google.com/maps/embed/v1/view?key=${GOOGLE_MAPS_API_KEY}&center=${this.mapOptions.lat},${this.mapOptions.lng}&zoom=${this.mapOptions.zoom}&maptype=satellite`;
  }
}

export class WikimapiaFrame extends MapObserver {
  getUrl() {
    return `https://wikimapia.org/#lat=${this.mapOptions.lat}&lon=${this.mapOptions.lng}&z=${this.mapOptions.zoom}&l=&ifr=1&m=w`;
  }
}

export class OsmFrame extends MapPublisher {
  constructor(
    public $element: HTMLIFrameElement,
    public mapOptions: MapOptions,
    public config: MapConfig,
  ) {
    super($element, mapOptions, config);

    this.instance = L.map($element as HTMLDivElement, {
      center: [this.mapOptions.lat, this.mapOptions.lng],
      zoom: this.mapOptions.zoom,
      layers: [osmLayers[this.currentLayer]],
      maxZoom: MAX_ZOOM,
    });

    L.control.layers(osmLayers).addTo(this.instance);

    // this.instance.on('zoomend', this.updatePosition);
    this.instance.on('moveend', this.updatePosition);
    this.instance.on('baselayerchange', (event: L.LayersControlEvent) => {
      this.currentLayer = event.name as LayerName;
      setUrlParams(this.getMapOptions(), this.currentLayer);
    });
  }

  private readonly instance: L.Map;
  private currentLayer: LayerName = DEFAULT_LAYER;

  private updatePosition = () => {
    this.publish({
      state: MessageState.MoveMap,
      data: this.getMapOptions(),
    });
    setUrlParams(this.getMapOptions(), this.currentLayer);
  };

  getUrl = () => '';
  getInstance() {
    return this.instance;
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
