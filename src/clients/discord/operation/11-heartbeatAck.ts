import {Operation} from './base.ts';
import type {IOperation} from './base.ts';

export interface IHeartbeatAckOperation extends IOperation {
  op: 11;
}

export const HeartbeatAckOperation = new Operation<IHeartbeatAckOperation>(11);
