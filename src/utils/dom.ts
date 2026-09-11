import type { DOMElements } from '../types.ts';

export const $: typeof document.querySelector = document.querySelector.bind(document);
export const $$: typeof document.querySelectorAll = document.querySelectorAll.bind(document);

export const hasMissingElements = ($elements: DOMElements): boolean =>
  Array.from($elements.values()).filter(($element) => $element === null).length > 0;

// mhetod that will display the missing elements IDs
export const getMissingElements = ($elements: DOMElements): string[] =>
  Array.from($elements.entries())
    .filter(([, $element]) => $element === null)
    .map(([key]) => key);

export const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);

export const isEmptyString = (str: string | null | undefined): boolean => !str || str.trim().length === 0;
