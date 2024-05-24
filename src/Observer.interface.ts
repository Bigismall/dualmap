import { Message } from './Message.type.ts';

export interface Observer {
  update: (publication: Message) => void;
}
