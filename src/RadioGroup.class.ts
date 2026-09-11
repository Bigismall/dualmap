import type { RadioItemAction } from './types.ts';

export class SelectGroupClass {
  protected $element: HTMLElement;

  constructor($element: HTMLElement, defaultValue: string, $action: RadioItemAction) {
    this.$element = $element;
    const $select = $element.querySelector('select');

    if (!$select) {
      throw new Error('Missing select element in select group.');
    }

    $select.value = defaultValue;
    $select.addEventListener('change', $action);
  }
}
