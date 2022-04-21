import { BaseCommandInteraction, Client, ContextMenuInteraction, Interaction } from "discord.js";
import { ChatCommand } from "../Command";
import { Commands } from "../Commands";

export default (client: Client): void => {
    client.on("interactionCreate", async (interaction: Interaction) => {
        if (interaction.isContextMenu() || interaction.isUserContextMenu()) {
            await handleContextCommand(client, interaction);
        } else if (interaction.isCommand()) {
            await handleSlashCommand(client, interaction);
        }
    });
}

async function handleSlashCommand(client: Client, interaction: BaseCommandInteraction): Promise<void> {
    const slashCommand = Commands.find(c => c.name === interaction.commandName) as ChatCommand;
    if (!slashCommand) {
        interaction.followUp({ content: "An error has occured while retrieving your command from the database." });
        return;
    }

    await interaction.deferReply();
    slashCommand.run(client, interaction);
}

async function handleContextCommand(client: Client, interaction: ContextMenuInteraction): Promise<void> {
    const contextCommand = Commands.find(c => c.name === interaction.commandName);
    if (!contextCommand) {
        interaction.followUp({ content: "An error has occured while retrieving your command from the database." });
        return;
    }
    await interaction.deferReply();
    contextCommand.run(client, interaction);
}