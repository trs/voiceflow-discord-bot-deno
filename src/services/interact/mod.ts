import * as Client from '@/clients/mod.ts';
import * as Op from '@/clients/discord/operation/mod.ts';
import {GatewayConnection, Intent} from '@/clients/discord/mod.ts';

import * as env from '@/env.ts';

export class Interact {
  public constructor(
    private readonly voiceflow: Client.Voiceflow,
    private readonly discord: Client.Discord
  ) {}

  @Op.EventOperationGuard((data: any) => data.author.id !== env.DISCORD_BOT_ID)
  async interact(data: any) {
    const reply = await this.voiceflow.interact(data.author.id, {
      request: {
        type: 'text',
        payload: data.content
      }
    });

    for (const trace of reply) {
      switch (trace.type) {
        case 'text': {
          const reply = trace.payload.message;

          await this.discord.createMessage(data.channel_id, {
            content: reply
          });
        }
      }
    }
  }

  public async connect() {
    const connection = new GatewayConnection(
      env.DISCORD_API_WS_URL ?? await GatewayConnection.getGatewayURL(env.DISCORD_API_URL!),
      env.DISCORD_API_BOT_TOKEN!
    );

    await connection.connect()
      .onEvent('MESSAGE_CREATE', this.interact.bind(this))
      .waitTillReady();

    connection.send(Op.IdentifyOperation.encode({
      token: env.DISCORD_API_BOT_TOKEN!,
      intents: Intent.DIRECT_MESSAGES,
      presence: {
        status: 'online',
        afk: false,
        activities: []
      },
      properties: {
        $os: Deno.build.os,
        $browser: 'Voiceflow',
        $device: 'Voiceflow'
      }
    }));

  }
}
