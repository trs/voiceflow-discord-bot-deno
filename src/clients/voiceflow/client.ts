import {Client} from '@/clients/client.ts';

export class Voiceflow extends Client {
  public interact(userID: string, request: Record<string, unknown>) {
    return this.request('POST', `state/user/${userID}/interact`, request);
  }
}
