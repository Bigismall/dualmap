import { type Message } from './Message.type';
import { Observer } from './Observer.interface.ts';

export interface Publisher {
  subscribers: Observer[];
  subscribe: (callback: Observer) => void;
  publish: (publication: Message) => void;
}
