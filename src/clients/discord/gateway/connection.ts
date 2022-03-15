import {MessageGuard, MessageOpGuard} from './utils.ts';
import * as Op from '../operation/mod.ts';
import type * as OpType from '../operation/mod.ts';
import type {IEventType} from '../types/mod.ts';

import {RECONNECT_CLOSE_EVENTS} from './const.ts';

export class GatewayConnection extends EventTarget {
  #url: string;
  #token: string;
  #socket: WebSocket | undefined;

  private sessionID: string | undefined;
  private heartbeatInterval: number | undefined;
  private heartbeatAcknowledged = true;
  private sequenceKey: number | null = null;
  private ready = false;

  public static async getGatewayURL(apiURL: string) {
    const route = new URL('v9/gateway', apiURL);
    const response = await fetch(route, {
      method: 'GET'
    });

    if (!response.ok)
      throw new Error(response.statusText);

    const json = await response.json();

    const url = new URL(json.url);
    url.searchParams.append('v', '9');
    url.searchParams.append('encoding', 'json');

    return url.href;
  }

  public constructor(url: string, token: string) {
    super();
    this.#url = url;
    this.#token = token;
  }

  public connect() {
    this.heartbeatAcknowledged = true;
    this.ready = false;
    this.#socket = new WebSocket(this.#url);
    this.#socket.addEventListener('message', this.handleAll.bind(this));
    this.#socket.addEventListener('message', this.handleHello.bind(this));
    this.#socket.addEventListener('message', this.handleHeartbeatAck.bind(this));
    this.#socket.addEventListener('message', this.handleReconnect.bind(this));
    this.#socket.addEventListener('message', this.handleReady.bind(this));
    this.#socket.addEventListener('close', this.handleClose.bind(this));

    this.#socket.addEventListener('close', (ev) => super.dispatchEvent(new CustomEvent('close', ev)));
    this.#socket.addEventListener('error', (ev) => super.dispatchEvent(new CustomEvent('error', ev)));
    this.#socket.addEventListener('message', (ev) => super.dispatchEvent(new CustomEvent('message', ev)));
    this.#socket.addEventListener('open', (ev) => super.dispatchEvent(new CustomEvent('open', ev)));

    return this;
  }

  public async waitTillReady() {
    return await new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        if (this.ready) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  }

  public send(op: OpType.IOperation) {
    this.#socket?.send(JSON.stringify(op));
  }

  public onEvent(event: IEventType, fn: (data: unknown) => void) {
    return this.onMessage((message) => fn(message.d), (value) => Op.EventOperation.isOperation(value) && value.t === event);
  }

  public onMessage(fn: (message: OpType.IOperation) => void): this;
  public onMessage<T extends OpType.IOperation>(fn: (message: T) => void, guard?: (value: unknown) => boolean): this;
  public onMessage<T extends OpType.IOperation>(fn: (message: T) => void, guard?: (value: unknown) => boolean) {
    if (!this.#socket) throw new Error('Call connect first');

    this.#socket.addEventListener('message', (ev) => {
      const data = JSON.parse(ev.data);
      if (guard?.(data) ?? true) fn(data);
    });

    return this;
  }

  #reconnect() {
    if (this.#socket?.readyState === WebSocket.OPEN || this.#socket?.readyState === WebSocket.CONNECTING)
      this.#socket?.close(1000);

    if (!this.sessionID) {
      return;
    }

    this.connect();

    this.send(Op.ResumeOperation.encode({
      token: this.#token,
      seq: this.sequenceKey,
      session_id: this.sessionID
    }));

    this.heartbeatAcknowledged = true;
  }

  @MessageGuard(Op.isOperation)
  private handleAll({data}: MessageEvent<OpType.IOperation>) {
    this.sequenceKey = data.s ?? null;
  }

  @MessageOpGuard(Op.HelloOperation)
  private handleHello({data}: MessageEvent<OpType.IHelloOperation>) {
    this.heartbeatInterval = setInterval(() => {
      // If we never got a response that the previous heartbeat was acknowledged,
      // We must disconnect and reconnect
      if (!this.heartbeatAcknowledged) {
        this.#reconnect();
        return;
      }

      this.heartbeatAcknowledged = false;
      this.send(Op.HeartbeatOperation.encode(this.sequenceKey));

      super.dispatchEvent(new Event('heartbeat'));
    }, data.d.heartbeat_interval);

    this.ready = true;
  }

  @MessageOpGuard(Op.HeartbeatAckOperation)
  private handleHeartbeatAck(_evt: MessageEvent<OpType.IHeartbeatAckOperation>) {
    // Confirm heartbeat ack
    this.heartbeatAcknowledged = true;
  }

  @MessageOpGuard(Op.ReadyOperation)
  private handleReady({data}: MessageEvent<OpType.IReadyOperation>) {
    this.sessionID = data.d.session_id;
  }

  @MessageOpGuard(Op.ReconnectOperation)
  private handleReconnect(_evt: MessageEvent<OpType.IReconnectOperation>) {
    this.#reconnect();
  }

  private handleClose(evt: CloseEvent) {
    clearInterval(this.heartbeatInterval);

    if (RECONNECT_CLOSE_EVENTS.has(evt.code)) {
      this.#reconnect();
    }
  }
}
