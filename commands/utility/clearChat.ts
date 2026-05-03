import {MessageFlags, SlashCommandBuilder} from "discord.js";
import {ChatInputCommandInteraction, InteractionContextType} from "discord.js";

export const data = new SlashCommandBuilder()
    .setName('clearchat')
    .setDescription('deletes bot messages')
    .setContexts(InteractionContextType.BotDM)
    .addIntegerOption((option)=> option.setName("quantity").setDescription("How many messages to scan backward and submit for deletion").setRequired(true).setMaxValue(100))

export async function execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.inGuild()){
        await interaction.reply({content: "Cleaning-up this mess..", flags: MessageFlags.Ephemeral});
        (await(await interaction.user.createDM()).messages.fetch({limit: interaction.options.getInteger("quantity")?? 0}))
            .filter((value, key) => {return value.author.id == interaction.client.user.id})
            .forEach(async (value) => {await value.delete()})
        await interaction.deleteReply();
    }else{
        await interaction.reply({content: `Not a DM channel`, flags: MessageFlags.Ephemeral});
    }
}