import { Message, MessageState } from './Message.type.ts';
import { Observer } from './Observer.interface.ts';
import { HIDDEN_CLASS, KEY_AXIS } from './constants.ts';

export class Axis implements Observer {
  constructor(private axis: NodeListOf<HTMLElement>) {}

  public update(publication: Message) {
    console.log('Publication:', publication, 'Observer: Axis');

    if (publication.state === MessageState.KeyPressed) {
      if (publication.data.key.toLowerCase() === KEY_AXIS) {
        this.toggle();
      }
    }
  }

  private toggle(): void {
    this.axis.forEach((el) => {
      el.classList.toggle(HIDDEN_CLASS);
    });
  }
}
