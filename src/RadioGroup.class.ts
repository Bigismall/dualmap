import { RadioItemAction } from './types.ts';

export class RadioGroupClass {
  protected $element: HTMLElement;

  constructor($element: HTMLElement, defaultValue: string, $action: RadioItemAction) {
    this.$element = $element;
    const $radios = Array.from($element.querySelectorAll('input[type="radio"]')) as HTMLInputElement[];

    $radios.map(($radio) => {
      $radio.checked = $radio.value === defaultValue;
      $radio.addEventListener('change', $action);
    });
  }
}
