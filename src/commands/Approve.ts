import { BaseCommandInteraction, Client, GuildMember } from "discord.js";
import { ApplicationCommandTypes } from "discord.js/typings/enums";
import { GetServerName } from "../Util";
import { Command } from "../Command";
import { OngoingVotes } from "../Data";
export const AngerApprove: Command = {
    name: "angerapprove",
    description: "Sets the designated anger channel.",
    type: ApplicationCommandTypes.CHAT_INPUT,
    run: async (client: Client, interaction: BaseCommandInteraction) => {
        if (!interaction.guildId) {
            await interaction.followUp({
                ephemeral: true,
                content: "Error issuing \"angerapprove\" command. (Generic Error while fetching guild)"
            });
            return;
        }

        if (!interaction.member) {
            await interaction.followUp({
                ephemeral: true,
                content: "Error issuing \"angerapprove\" command. (Could not fetch member)"
            });
            return;
        }

        const issuerMember = interaction.member as GuildMember;
        const currentVote = OngoingVotes.get(interaction.guildId);
        if (!currentVote) {
            await interaction.followUp({
                ephemeral: true,
                content: "An ongoing vote was not found."
            });
            return;
        }
        if (!currentVote.allowedVotersIds.some(x => x === issuerMember.user.id)) {
            await interaction.followUp({
                ephemeral: true,
                content: `User ${GetServerName(issuerMember)} is not allowed to participate in the current vote.`
            });
            return;
        }

        if (currentVote.votedBallets.has(issuerMember.id)) {
            await interaction.followUp({
                ephemeral: true,
                content: `User ${GetServerName(issuerMember)} has already cast their vote.`
            });
            return;
        }

        currentVote.votedBallets.add(issuerMember.id);
        await interaction.followUp({
            ephemeral: true,
            content: `${GetServerName(issuerMember)}'s ballet has been cast to the void.`
        });
    }
};