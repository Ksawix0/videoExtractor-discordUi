import {Guild, SlashCommandBuilder} from 'discord.js';
import {ChatInputCommandInteraction} from "discord.js";

export const data= new SlashCommandBuilder().setName('server').setDescription('Provides information about the server.')

export async function execute(interaction : ChatInputCommandInteraction) {
    // interaction.guild is the object representing the Guild in which the command was run
    await interaction.reply(
        `This server is ${(interaction.guild as Guild).name} and has ${(interaction.guild as Guild).memberCount} members.`
    );
}

// module.exports = {
//     data: new SlashCommandBuilder().setName('server').setDescription('Provides information about the server.'),
//     async execute(interaction) {
//         // interaction.guild is the object representing the Guild in which the command was run
//         await interaction.reply(
//             `This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`,
//         );
//     },
// };