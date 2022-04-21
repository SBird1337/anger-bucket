import { BaseCommandInteraction, Client } from "discord.js";
import { ApplicationCommandTypes } from "discord.js/typings/enums";
import { Command } from "../Command";
import { AngerChannels } from "../Data";

export const SetChannel: Command = {
    name: "setangerchannel",
    description: "Sets the designated anger channel.",
    type: ApplicationCommandTypes.CHAT_INPUT,
    run: async (client: Client, interaction: BaseCommandInteraction) => {
        let content = "";
        if (interaction.guildId && interaction.member) {
            const guild = client.guilds.cache.get(interaction.guildId);
            const member = guild?.members.cache.get(interaction.member.user.id);
            const voiceChannel = member?.voice.channel;
            if (voiceChannel) {
                AngerChannels.set(interaction.guildId, voiceChannel.id);
                content = `Anger Channel set to ${voiceChannel.name}`;
            } else {
                content = "Join a voice channel to indicate the Anger Channel before issuing this command."
            }
        } else {
            content = "Error setting the Anger Channel."
        }
        await interaction.followUp({
            ephemeral: true,
            content: content
        });
    }
};