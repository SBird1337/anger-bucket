import { Client, Intents} from "discord.js"
import interactionCreate from "./listeners/interactionCreate";
import ready from "./listeners/ready";

if (!process.env.API_TOKEN) {
    console.error("Please set the API_TOKEN environment variable to your Discord Application Token.");
    process.exit(1);
}

console.log("Bot is starting...");

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES
    ]
});

ready(client)
interactionCreate(client);
client.login(process.env.API_TOKEN);
