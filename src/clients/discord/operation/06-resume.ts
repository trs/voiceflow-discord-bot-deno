import {Operation} from './base.ts';
import type {IOperation} from './base.ts';

export interface IResumeOperation extends IOperation {
  op: 6;
  d: {
    token: string,
    session_id: string,
    seq: number | null
  }
}

export const ResumeOperation = new Operation<IResumeOperation>(6);
