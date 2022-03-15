export interface IOperation {
  op: number;
  d?: unknown;
  s?: number | null;
  t?: string | null;
}

export const isOperation = (value: unknown): value is IOperation =>
  value != null && typeof (value as {op?: unknown}).op === 'number';

export class Operation<OP extends IOperation> {
  public constructor(public readonly code: OP['op']) {}

  public isOperation(value: unknown): value is OP {
    return isOperation(value) && value.op === this.code;
  }

  public encode(value: OP['d']): OP {
    return {
      op: this.code,
      d: value
    } as OP;
  }
}
