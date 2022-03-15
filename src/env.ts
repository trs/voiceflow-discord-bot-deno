import { config } from "dotenv/mod.ts";
config({export: true});

export const VOICEFLOW_API_URL = Deno.env.get('VOICEFLOW_API_URL');
export const VOICEFLOW_API_KEY = Deno.env.get('VOICEFLOW_API_KEY');

export const DISCORD_BOT_ID = Deno.env.get('DISCORD_BOT_ID');
export const DISCORD_API_URL = Deno.env.get('DISCORD_API_URL');
export const DISCORD_API_BOT_TOKEN = Deno.env.get('DISCORD_API_BOT_TOKEN');
export const DISCORD_API_WS_URL = Deno.env.get('DISCORD_API_WS_URL');
