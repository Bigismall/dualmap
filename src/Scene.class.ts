import { Message, MessageState } from './Message.type.ts';
import { Observer } from './Observer.interface.ts';
import { Publisher } from './Publisher.interface.ts';

export class Scene implements Publisher {
  subscribers: Observer[] = [];

  constructor() {
    window.addEventListener('keydown', (event) => {
      this.publish({ state: MessageState.KeyPressed, data: { key: event.key } });
    });
  }
  subscribe(callback: Observer): void {
    this.subscribers.push(callback);
  }

  publish(publication: Message): void {
    this.subscribers.forEach((subscriber) => {
      subscriber.update(publication);
    });
  }
}
