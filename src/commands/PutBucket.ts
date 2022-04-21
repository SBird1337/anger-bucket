import { Client, ContextMenuInteraction, Guild, GuildMember, TextBasedChannel } from "discord.js";
import { ApplicationCommandTypes } from "discord.js/typings/enums";
import { Command } from "../Command";
import { AngerChannels, OngoingVotes, BucketLocks, BucketVote } from "../Data";
import { createAudioPlayer, createAudioResource, DiscordGatewayAdapterCreator, joinVoiceChannel } from "@discordjs/voice";
import { GetServerName } from "../Util";

export const PutBucket: Command = {
    name: "Apply Bucket",
    type: ApplicationCommandTypes.USER,
    run: async (client: Client, interaction: ContextMenuInteraction) => {

        if (!interaction.channel) {
            await interaction.followUp({
                ephemeral: true,
                content: "Error issuing \"Apply Bucket\" command. (Channel Error)"
            });
            return;
        }

        if (!interaction.guildId) {
            await interaction.followUp({
                ephemeral: true,
                content: "Error issuing \"Apply Bucket\" command. (Generic Error)"
            });
            return;
        }
        const guild = client.guilds.cache.get(interaction.guildId);
        if (!guild) {
            await interaction.followUp({
                ephemeral: true,
                content: "Error issuing \"Apply Bucket\" command. (Could not fetch guild)"
            });
            return;
        }
        const angerChannelId = AngerChannels.get(guild.id);
        if (!angerChannelId) {
            await interaction.followUp({
                ephemeral: true,
                content: "Could not find anger channel, make sure to set it using `/setangerchannel`."
            });
            return;
        }
        const accusedUser = await client.users.fetch(interaction.targetId);
        if (accusedUser.bot) {
            await interaction.followUp({
                ephemeral: true,
                content: `${accusedUser.username} is a bot. Use this function on a regular user.`
            });
            return;
        }
        const accusedMember = await guild.members.fetch(accusedUser);

        const issuerMember = guild.members.fetch(interaction.user.id);
        const issuerVoiceChannel = (await issuerMember).voice.channel;
        if (!issuerVoiceChannel) {
            await interaction.followUp({
                ephemeral: true,
                content: "You are not in a voice channel, you can only issue this command from a voice channel."
            });
            return;
        }
        if (!issuerVoiceChannel.members.has(accusedMember.id)) {
            await interaction.followUp({
                ephemeral: true,
                content: `${GetServerName(accusedMember)} is not in a voice channel with you. No need to give them the bucket treatment.`
            });
            return;
        }
        const currentVote = OngoingVotes.get(guild.id);
        if (currentVote != null) {
            const user = await client.users.fetch(currentVote.accusedId);
            const member = await guild.members.fetch(user);
            await interaction.followUp({
                ephemeral: true,
                content: `A vote is currently in progress against ${GetServerName(member)}. Please finish it before starting another one.`
            });
            return;
        }
        const eligibleVoters = Array.from(issuerVoiceChannel.members.values()).filter(member => member.id !== accusedMember.id);
        const eligibleNames = eligibleVoters.map(member => `\`${GetServerName(member)}\``);
        const newVote: BucketVote = {
            accusedId: accusedMember.id,
            allowedVotersIds: eligibleVoters.map(member => member.id),
            votedBallets: new Set<string>()
        }
        OngoingVotes.set(guild.id, newVote);
        await interaction.followUp({
            ephemeral: true,
            content: `A vote has been started, eligible voters are ${eligibleNames.join(", ")}. Use \`/angerapprove\` to cast your vote. I need a majority vote to execute the request.`
        });
        HandleBucketVote(newVote, guild, interaction.channel, client, angerChannelId);
        return;
    }
};

async function HandleBucketChannel(member: GuildMember, angerChannel: string, guild: Guild): Promise<void> {
    if (member.voice.channel) {
        const originalChannel = member.voice.channelId;
        member.voice.setChannel(angerChannel);
        const connection = joinVoiceChannel({
            channelId: angerChannel,
            guildId: member.guild.id,
            adapterCreator: member.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
            selfDeaf: false
        });
        // We need to play something in order to start receiving
        const player = createAudioPlayer();
        const resource = createAudioResource("./resources/Loopo_a.wav");
        connection.subscribe(player);
        player.play(resource);

        const stream = connection.receiver.subscribe(member.user.id);
        stream.on("data", (chunk => {
            console.log("recv chunk");
            connection.playOpusPacket(chunk);
        }));

        for (let i = 0; i < 60 * 2; ++i) {
            if (member.voice.channel && member.voice.channelId !== angerChannel) {
                member.voice.setChannel(angerChannel);
            } else if (!member.voice.channel) {
                i--;
            }
            await new Promise(r => setTimeout(r, 500));
        }
        member.voice.setChannel(originalChannel);
        stream.destroy();
        connection.disconnect();
        connection.destroy();
    }
}

async function HandleBucketVote(vote: BucketVote, guild: Guild, channel: TextBasedChannel, client: Client, angerChannelId: string): Promise<void> {
    //TODO: Implement voting mechanism
    const accusedUser = await client.users.fetch(vote.accusedId);
    const accusedMember = await guild.members.fetch(accusedUser);
    let elected = false;
    for (let i = 0; i < 120; ++i) {
        if (vote.votedBallets.size > (vote.allowedVotersIds.length / 2)) {
            elected = true;
            break;
        }
        await new Promise(r => setTimeout(r, 1000));
    }
    if (elected) {
        channel.send(`${GetServerName(accusedMember)} is given a minute to cry out their anger into my empty metal husk.`);
        await HandleBucketChannel(accusedMember, angerChannelId, guild)
        channel.send(`Let's all welcome back ${GetServerName(accusedMember)}. I hope you calmed down now.`)
    } else {
        channel.send(`The vote against ${accusedMember} was unanimous. I will get you next time.`)
    }
    OngoingVotes.set(guild.id, null);
}