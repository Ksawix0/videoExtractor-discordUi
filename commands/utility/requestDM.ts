import {ContextMenuCommandBuilder, ApplicationCommandType, MessageFlags} from 'discord.js';
import {UserContextMenuCommandInteraction} from "discord.js";
const confirmationResponse =  (await import('../../assets/confirmation-as-a-service.json')).default;

export const data = new ContextMenuCommandBuilder()
    .setName('requestDM')
    .setType(ApplicationCommandType.User)
export async function execute(interaction: UserContextMenuCommandInteraction) {
    await interaction.reply({content: "Wait a second", flags: MessageFlags.Ephemeral});
    await interaction.user.send(confirmationResponse[Math.floor(Math.random() * confirmationResponse.length)]?? "");
    await interaction.deleteReply();
}