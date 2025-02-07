import { HIDDEN_CLASS, KEY_AXIS } from './constants.ts';
import { Message, MessageState, Observer } from './types.ts';
import { log } from './utils/console.ts';

export class Axis implements Observer {
  constructor(private axis: NodeListOf<HTMLElement>) {
    let timeoutId: number;
    window.addEventListener('mousemove', (event) => {
      if (timeoutId) {
        window.cancelAnimationFrame(timeoutId);
      }
      timeoutId = window.requestAnimationFrame(() => {
        const { clientX: x, clientY: y } = event;
        this.updateAxisPosition(x, y);
      });
    });
  }

  private updateAxisPosition(x: number, y: number): void {
    this.axis.forEach((el) => {
      el.style.setProperty('--axis-horizontal', `${x}px`);
      el.style.setProperty('--axis-vertical', `${y}px`);
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
