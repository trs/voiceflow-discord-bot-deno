import {Discord, Voiceflow} from '@/clients/mod.ts';
import {Interact} from '@/services/mod.ts';

import * as env from '@/env.ts';

const voiceflow = new Voiceflow(env.VOICEFLOW_API_URL!)
  .setToken(env.VOICEFLOW_API_KEY!);

const discord = new Discord(env.DISCORD_API_URL!)
  .setToken(env.DISCORD_API_BOT_TOKEN!);

const interact = new Interact(voiceflow, discord);
await interact.connect();
