import {SlashCommandBuilder} from "discord.js";
import {ChatInputCommandInteraction} from "discord.js";
import {GuildMember} from "discord.js";

export const data = new SlashCommandBuilder().setName('user').setDescription('Provides information about the user.')

export async function execute(interaction: ChatInputCommandInteraction) {
    // interaction.user is the object representing the User who ran the command
    // interaction.member is the GuildMember object, which represents the user in the specific guild
    await interaction.reply(
        `This command was run by ${interaction.user.username}, who joined on ${(interaction.member as GuildMember).joinedAt}.`,
    );
}

// module.exports = {
//     data: new SlashCommandBuilder().setName('user').setDescription('Provides information about the user.'),
//     async execute(interaction: ChatInputCommandInteraction<CacheType>) {
//         // interaction.user is the object representing the User who ran the command
//         // interaction.member is the GuildMember object, which represents the user in the specific guild
//         await interaction.reply(
//             `This command was run by ${interaction.user.username}, who joined on ${interaction.member.joinedAt}.`,
//         );
//     },
// };