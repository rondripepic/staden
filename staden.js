const {
    Client,
    GatewayIntentBits,
    PermissionsBitField
} = require('discord.js');

require('dotenv').config();

const fs = require('fs');


// =========================
// CONFIG
// =========================

const configFile = './config.json';

const ownerId = process.env.OWNER_ID;


// =========================
// CONFIG FUNCTIONS
// =========================

function loadConfig() {

    return JSON.parse(
        fs.readFileSync(configFile, 'utf8')
    );

}


function saveConfig(config) {

    fs.writeFileSync(
        configFile,
        JSON.stringify(config, null, 4)
    );

}


// =========================
// DISCORD CLIENT
// =========================

const client = new Client({

    intents: [

        GatewayIntentBits.Guilds,

        GatewayIntentBits.GuildMessages,

        GatewayIntentBits.MessageContent

    ]

});


// =========================
// BOT READY
// =========================

client.once('ready', () => {

    console.log(
        `Logged in as ${client.user.tag}`
    );

});


// =========================
// SLASH COMMANDS
// =========================

client.on(
    'interactionCreate',
    async interaction => {

        if (
            !interaction.isChatInputCommand()
        ) {
            return;
        }


        // Only allow you to use commands
        if (
            interaction.user.id !== ownerId
        ) {

            return interaction.reply({

                content:
                    'You do not have permission to use this command.',

                ephemeral: true

            });

        }


        const config =
            loadConfig();


        // =========================
        // /setuser
        // =========================

        if (
            interaction.commandName ===
            'setuser'
        ) {

            const user =
                interaction.options.getUser(
                    'user'
                );


            config.targetUserId =
                user.id;


            saveConfig(config);


            await interaction.reply(

                `Target user set to **${user.tag}**.`

            );

        }


        // =========================
        // /setchannel
        // =========================

        if (
            interaction.commandName ===
            'setchannel'
        ) {

            const channel =
                interaction.options.getChannel(
                    'channel'
                );


            config.destinationChannelId =
                channel.id;


            saveConfig(config);


            await interaction.reply(

                `Destination channel set to <#${channel.id}>.`

            );

        }


        // =========================
        // /setmessage
        // =========================

        if (
            interaction.commandName ===
            'setmessage'
        ) {

            const text =
                interaction.options.getString(
                    'text'
                );


            config.forwardMessage =
                text;


            saveConfig(config);


            await interaction.reply(

                `Forward message changed to:\n> ${text}`

            );

        }


        // =========================
        // /status
        // =========================

        if (
            interaction.commandName ===
            'status'
        ) {

            const targetUser =

                config.targetUserId

                    ? `<@${config.targetUserId}>`

                    : 'Not set';


            const destinationChannel =

                config.destinationChannelId

                    ? `<#${config.destinationChannelId}>`

                    : 'Not set';


            const forwardMessage =

                config.forwardMessage

                    ? config.forwardMessage

                    : 'Not set';


            await interaction.reply(

                `**Staden Status**\n\n` +

                `Target User: ${targetUser}\n` +

                `Destination Channel: ${destinationChannel}\n` +

                `Forward Message: ${forwardMessage}`

            );

        }

    }

);


// =========================
// MESSAGE FORWARDING
// =========================

client.on(
    'messageCreate',
    async message => {

        try {

            const config =
                loadConfig();


            // No target user configured
            if (
                !config.targetUserId
            ) {
                return;
            }


            // No destination channel configured
            if (
                !config.destinationChannelId
            ) {
                return;
            }


            // Ignore bots
            if (
                message.author.bot
            ) {
                return;
            }


            // Only forward messages
            // from the selected user
            if (

                message.author.id !==
                config.targetUserId

            ) {

                return;

            }


            // Don't forward messages
            // from the destination channel
            if (

                message.channel.id ===
                config.destinationChannelId

            ) {

                return;

            }


            // Ignore webhooks
            if (
                message.webhookId
            ) {
                return;
            }


            // Fetch destination channel
            const destinationChannel =

                await client.channels.fetch(

                    config.destinationChannelId

                );


            if (
                !destinationChannel
            ) {

                console.error(

                    'Destination channel not found.'

                );

                return;

            }


            // Get message content
            const content =
                message.content || '';


            // Get images/files
            const files =

                message.attachments.map(

                    attachment =>
                        attachment.url

                );


            // Ignore empty messages
            if (

                !content &&
                files.length === 0

            ) {

                return;

            }


            // Create forwarded message
            const responseText =

                `${content || '[no text content]'}\n` +

                `${config.forwardMessage || ''}`;


            // Send message and attachments
            await destinationChannel.send({

                content: responseText,

                files: files

            });


            console.log(

                `Forwarded message ${message.id}`

            );


            // =========================
            // DELETE ORIGINAL MESSAGE
            // =========================

            const botMember =

                message.guild?.members.cache.get(

                    client.user.id

                );


            if (

                botMember &&

                message.channel
                    .permissionsFor(botMember)
                    .has(

                        PermissionsBitField.Flags
                            .ManageMessages

                    )

            ) {

                await message.delete();


                console.log(

                    `Deleted original message ${message.id}`

                );

            }


        } catch (error) {

            console.error(

                'Error forwarding message:',

                error

            );

        }

    }

);


// =========================
// LOGIN
// =========================

client.login(

    process.env.DISCORD_TOKEN

);