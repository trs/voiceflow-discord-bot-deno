import {Operation} from './base.ts';
import type {IOperation} from './base.ts';

export interface IHelloOperation extends IOperation {
  op: 10;
  d: {
    heartbeat_interval: number;
  }
}

export const HelloOperation = new Operation<IHelloOperation>(10);
