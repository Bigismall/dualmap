import { DOMElements } from '../types.ts';

export const $: typeof document.querySelector = document.querySelector.bind(document);
export const $$: typeof document.querySelectorAll = document.querySelectorAll.bind(document);

// Missing elements method

export const hasMissingElements = ($elements: DOMElements): boolean =>
  Array.from($elements.values()).filter(($element) => $element === null).length > 0;
