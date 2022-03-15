import {Client} from '@/clients/client.ts';

export class Discord extends Client {
  public setToken(token: string) {
    return super.setToken(`Bot ${token}`)
  }

  public createMessage(channel: string, message: Record<string, unknown>) {
    return this.request('POST', `v9/channels/${channel}/messages`, message);
  }
}
