import { Message } from './types';

export interface Observer {
  update: (publication: Message) => void;
}
