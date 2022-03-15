import {Operation} from './base.ts';
import type {IOperation} from './base.ts';

export interface IReadyOperation extends IOperation {
  op: 2;
  d: {
    v: number;
    session_id: string;
  };
}

export const ReadyOperation = new Operation<IReadyOperation>(2);
