import {SlashCommandBuilder} from "discord.js";
import {ChatInputCommandInteraction} from "discord.js";

export const data = new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!')
export async function execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply('Pong!');
    }
// module.exports = {
//     data: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!'),
//     async execute(interaction) {
//         await interaction.reply('Pong!');
//     },
// };