import { HIDDEN_CLASS, KEY_AXIS } from './constants.ts';
import { Message, MessageState, Observer } from './types.ts';
import { log } from './utils/console.ts';

export class Axis implements Observer {
  constructor(private axis: NodeListOf<HTMLElement>) {
    // On mouse move
    window.addEventListener('mousemove', (event) => {
      const x = event.clientX;
      const y = event.clientY;
      axis.forEach((el) => {
        el.style.setProperty('--axis-horizontal', `${x}px`);
        el.style.setProperty('--axis-vertical', `${y}px`);
      });
    });
  }

  public update(publication: Message) {
    log('Publication:', publication, 'Observer: Axis');

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
