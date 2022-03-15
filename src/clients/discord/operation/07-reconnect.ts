import {Operation} from './base.ts';
import type {IOperation} from './base.ts';

export interface IReconnectOperation extends IOperation {
  op: 7;
  d: null
}

export const ReconnectOperation = new Operation<IReconnectOperation>(7);
