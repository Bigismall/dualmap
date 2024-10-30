import { Observer } from './Observer.interface.ts';
import { Message } from './types.ts';

export interface Publisher {
  subscribers: Observer[];
  subscribe: (callback: Observer) => void;
  publish: (publication: Message) => void;
}
