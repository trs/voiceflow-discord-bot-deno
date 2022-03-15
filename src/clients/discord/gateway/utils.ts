import {Operation} from '../operation/base.ts';
import type {IOperation} from '../operation/base.ts';

export function MessageGuard(guard: (value: unknown) => boolean): MethodDecorator {
  return function (target, _p, descriptor: TypedPropertyDescriptor<any>) {
    const originalMethod = descriptor.value;

    descriptor.value = function (this: typeof target, event: MessageEvent<string>) {
      const data = JSON.parse(event.data);
      if (guard(data)) {
        originalMethod.call(this, {data});
      }
    };

    return descriptor;
  };
}

export function MessageOpGuard<OP extends IOperation, T extends Operation<OP>>(instance: T): MethodDecorator {
  return MessageGuard(instance.isOperation.bind(instance));
}
