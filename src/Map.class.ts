import { type MapConfig, type MapOptions, type Message, MessageState, type Observer, type Publisher } from './types';
import { log } from './utils/console.ts';

export abstract class MapFrame {
  public $parent: HTMLElement | null = null;

  public constructor(
    public $element: HTMLElement,
    public mapOptions: MapOptions,
    public config: MapConfig,
  ) {
    this.$parent = $element.parentElement;
    this.destroy();

    if (config.frame) {
      this.$element.appendChild(this.generateIFrameElement());
    }
  }
  private generateIFrameElement(): HTMLIFrameElement {
    const $frame = document.createElement('iframe');
    $frame.src = '';
    $frame.width = '100%';
    $frame.height = '100%';
    $frame.loading = 'lazy';
    $frame.classList.add('layout__frame');
    $frame.title = 'Map';
    return $frame;
  }

  abstract getUrl(): string;

  public render(): void {
    (this.$element.firstChild as HTMLIFrameElement).src = this.getUrl();
  }

  public setOptions(options: MapOptions): void {
    this.mapOptions = { ...options };
  }

  public destroy(): void {
    this.$element.innerText = '';
  }

  public hide(): void {
    this.$element.classList.add('hidden');
  }

  public show(): void {
    this.$element.classList.remove('hidden');
  }
}

export class MapObserver extends MapFrame implements Observer {
  getUrl(): string {
    throw new Error('Method not implemented.');
  }

  public update(publication: Message) {
    log('Publication:', publication, 'Observer:', this.$element.title);
    if (publication.state === MessageState.MoveMap) {
      this.setOptions(publication.data);
      this.render();
    }
    if (publication.state === MessageState.Reload) {
      this.render();
    }
  }
}

export class MapPublisherObserver extends MapFrame implements Publisher, Observer {
  public subscribers: Observer[] = [];

  getUrl(): string {
    throw new Error('Method not implemented.');
  }

  update(_publication: Message): void {
    throw new Error('Method not implemented.');
  }

  subscribe(callback: Observer) {
    this.subscribers.push(callback);
  }

  unsubscribe(subscriber: Observer) {
    this.subscribers = this.subscribers.filter((s) => s !== subscriber);
  }

  publish(publication: Message) {
    this.subscribers.map((s) => {
      s.update(publication);
      return s;
    });
  }
}
