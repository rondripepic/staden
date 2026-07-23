const {
    REST,
    Routes,
    SlashCommandBuilder
} = require('discord.js');

require('dotenv').config();

const commands = [

    new SlashCommandBuilder()
        .setName('setuser')
        .setDescription('Set the user whose messages should be forwarded')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to monitor')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('setchannel')
        .setDescription('Set the channel where messages should be forwarded')
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('The destination channel')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('setmessage')
        .setDescription('Change the message added to forwarded messages')
        .addStringOption(option =>
            option
                .setName('text')
                .setDescription('The message to add')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('status')
        .setDescription('Show the current Staden settings')

];

const rest = new REST({ version: '10' })
    .setToken(process.env.DISCORD_TOKEN);

(async () => {

    try {

        console.log('Registering slash commands...');

        await rest.put(

            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),

            {
                body: commands
            }

        );

        console.log(
            'Slash commands registered successfully.'
        );

    } catch (error) {

        console.error(error);

    }

})();