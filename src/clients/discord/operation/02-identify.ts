import {Operation} from './base.ts';
import type {IOperation} from './base.ts';
import type {Intent} from '@/clients/discord/mod.ts';

export interface IIdentifyOperation extends IOperation {
  op: 2;
  d: {
    token: string;
    properties: {
      $os: string;
      $browser: string;
      $device: string;
    };
    intents: Intent;
    compress?: boolean;
    large_threshold?: number;
    shard?: [shard_id: number, num_shards: number];
    presence?: unknown;
  }
}

export const IdentifyOperation = new Operation<IIdentifyOperation>(2);
