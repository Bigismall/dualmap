import { Message, MessageState } from './Message.type.ts';
import { Observer } from './Observer.interface.ts';

export class Axis implements Observer {
  constructor(private axis: NodeListOf<HTMLElement>) {}

  public update(publication: Message) {
    console.log('Publication:', publication, 'Observer: Axis');

    if (publication.state === MessageState.KeyPressed) {
      if (publication.data.key.toLowerCase() === 'a') {
        this.toggle();
      }
    }
  }

  private toggle(): void {
    this.axis.forEach((el) => {
      el.classList.toggle('hidden');
    });
  }
}
