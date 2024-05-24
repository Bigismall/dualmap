import { MapOptions } from './types.ts';

export enum MessageState {
  Show = 'Show',
  Hide = 'Hide',
  MoveMap = 'MoveMap', //Same as resize
}

export type Message =
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
