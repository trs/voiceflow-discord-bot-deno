import {GatewayConnection, Intent} from '@/clients/discord/mod.ts';
import * as Op from '@/clients/discord/operation/mod.ts';

import * as env from '@/env.ts';

const connection = new GatewayConnection(
  env.DISCORD_API_WS_URL ?? await GatewayConnection.getGatewayURL(env.DISCORD_API_URL!),
  env.DISCORD_API_BOT_TOKEN!
);

await connection.connect()
  .onEvent('MESSAGE_CREATE', async (data: any) => {
    if (data.author.id === env.DISCORD_BOT_ID) return;

    await voiceflowInteract(data)
      .catch((err) => console.error(err));
  })
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

async function voiceflowInteract(data: any) {
  const url = new URL(`state/user/${data.author.id}/interact`, env.VOICEFLOW_API_URL!);

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: env.VOICEFLOW_API_KEY!
    },
    body: JSON.stringify({
      request: {
        type: 'text',
        payload: data.content
      }
    })
  });

  if (!resp.ok) throw new Error(resp.statusText);

  const json = await resp.json();

  for (const trace of json) {
    switch (trace.type) {
      case 'text': {
        const reply = trace.payload.message;

        const url = new URL(`v9/channels/${data.channel_id}/messages`, env.DISCORD_API_URL!);

        await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bot ${env.DISCORD_API_BOT_TOKEN!}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: reply
          })
        });
      }
    }
  }
}
