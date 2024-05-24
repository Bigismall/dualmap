import { MapOptions } from './types.ts';

export enum MessageState {
  Reset = 'Reset',
  Show = 'Show',
  Hide = 'Hide',
  MoveMap = 'MoveMap',
  ResizeMap = 'ResizeMap',
}

export type Message =
  | {
      state: MessageState.Reset;
      data?: never;
    }
  | {
      state: MessageState.Hide;
      data?: never;
    }
  | {
      state: MessageState.Show;
      data?: never;
    }
  | {
      state: MessageState.MoveMap;
      data: MapOptions;
    };
