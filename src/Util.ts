import { GuildMember } from "discord.js";

export function GetServerName(member: GuildMember): string {
    return member.nickname || member.user.username;
}