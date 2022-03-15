import {Operation} from './base.ts';
import type {IOperation} from './base.ts';
import type {IEventType} from '../types/mod.ts';

export interface IEventOperation extends IOperation {
  op: 0;
  t: IEventType;
  d: unknown;
}

export const EventOperation = new Operation<IEventOperation>(0);
