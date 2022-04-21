import { BaseCommandInteraction, ChatInputApplicationCommandData, Client, ContextMenuInteraction, MessageApplicationCommandData, UserApplicationCommandData } from "discord.js";

export interface ChatCommand extends ChatInputApplicationCommandData {
    run: (client: Client, interaction: BaseCommandInteraction) => void;
}

export interface UserCommand extends UserApplicationCommandData {
    run: (client: Client, interaction: ContextMenuInteraction) => void;
}

export interface MessageCommand extends MessageApplicationCommandData {
    run: (client: Client, interaction: ContextMenuInteraction) => void;
}

export type Command = ChatCommand | UserCommand | MessageCommand;