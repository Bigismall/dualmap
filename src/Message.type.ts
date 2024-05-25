import { MapOptions } from './types.ts';

export enum MessageState {
  MoveMap = 'MoveMap', //Same as resize
  KeyPressed = 'KeyPressed',
}

export type Message =
  | {
      state: MessageState.KeyPressed;
      data: {
        key: string;
      };
    }
  | {
      state: MessageState.MoveMap;
      data: MapOptions;
    };
