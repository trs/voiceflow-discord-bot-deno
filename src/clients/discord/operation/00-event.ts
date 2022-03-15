import {Operation} from './base.ts';
import type {IOperation} from './base.ts';
import type {IEventType} from '../types/mod.ts';

export interface IEventOperation extends IOperation {
  op: 0;
  t: IEventType;
  d: unknown;
}

export const EventOperation = new Operation<IEventOperation>(0);

export const isEventOperation = (guard: (data: IEventOperation['d']) => boolean) => (data: IEventOperation) => guard(data);

export const EventOperationGuard = (guard: (data: IEventOperation['d']) => boolean): MethodDecorator => {
  return function (target, _p, descriptor: TypedPropertyDescriptor<any>) {
    const originalMethod = descriptor.value;

    descriptor.value = function (this: typeof target, data: IEventOperation) {
      if (guard(data)) {
        originalMethod.call(this, data);
      }
    };

    return descriptor;
  };
}
