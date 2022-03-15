import {Operation} from './base.ts';
import type {IOperation} from './base.ts';

export interface IHeartbeatOperation extends IOperation {
  op: 1;
  d: number | null;
}

export const HeartbeatOperation = new Operation<IHeartbeatOperation>(1);
