import {
    ApplicationCommandType,
    Client,
    Collection,
    Events,
    GatewayIntentBits,
    MessageFlags,
    Partials,
    REST,
    Routes
} from 'discord.js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {type Browser, type BrowserContext, chromium} from 'playwright-core';
import {getVideo} from "./commands/responses/getVideo.ts";

const client = new Client({
    intents: [
        // GatewayIntentBits.Guilds,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.Channel
    ]
});


//? import commands
declare module 'discord.js' {
    interface Client {
        commands : Collection<any, any>
        browser: Browser
        browserContext: BrowserContext
    }
}

console.log("Launching headless browser (chromium)")
client.browser = await chromium.launch()
console.log("Successfully launched headless browser, launching browser context")
client.browserContext = await client.browser.newContext({viewport: { width: 1920, height: 1080 }, userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"})
console.log("Successfully launched browser context")

//? gathering info about commands in client.commands and commands[]
const commands = [];
client.commands = new Collection();
const foldersPath = path.join(import.meta.dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);
for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.ts'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = await import("file://" + filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            commands.push(command.data.toJSON());
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

//? register commands
const rest = new REST().setToken(process.env["DISCORD_TOKEN"]?? "");
// and deploy your commands!
(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // The put method is used to fully refresh all commands in the guild with the current set
        const data : Array<any> = await rest.put(Routes.applicationCommands(process.env.clientId?? ""), { body: commands }) as Array<any>;

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
})();


client.on(Events.InteractionCreate, async (interaction) => {
    //? Chat commands handler
    if (interaction.isChatInputCommand()){
        const command = interaction.client.commands.filter((value) => {return value.data.type == 1 || value.data.type == undefined }).get(interaction.commandName);
        if (command == undefined) {
            console.error(`No chat command matching ${interaction.commandName} was found.`);
            return;
        }
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: 'There was an error while executing this command!',
                    flags: MessageFlags.Ephemeral,
                });
            } else {
                await interaction.reply({
                    content: 'There was an error while executing this command!',
                    flags: MessageFlags.Ephemeral,
                });
            }
        }
    //? Context menu commands handler
    }else if (interaction.isContextMenuCommand()){
        const command = interaction.client.commands.filter((value) => {return value.data.type !=1 }).get(interaction.commandName);
        if (command == undefined) {
            console.error(`No context command matching ${interaction.commandName} was found.`);
            return;
        }
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: 'There was an error while executing this command!',
                    flags: MessageFlags.Ephemeral,
                });
            } else {
                await interaction.reply({
                    content: 'There was an error while executing this command!',
                    flags: MessageFlags.Ephemeral,
                });
            }
        }
    }
});

client.on(Events.MessageCreate, async (message) => {
     if(message.channel.partial) { message.channel = await message.channel.fetch() }
     if(message.channel.isDMBased() && message.author.id != message.client.user.id){
         if(new RegExp("^(?:http://|https://)").test(message.content)) {
            await getVideo(message)
         }
     }
})

client.once(Events.ClientReady, (clientReady : Client<true>) => {
    console.log(`Ready! Logged in as ${clientReady.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);