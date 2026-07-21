const { Client, GatewayIntentBits } = require('discord.js');
const { fetch } = require('undici');


const token = process.env.DISCORD_TOKEN;
const targetUserId = process.env.TARGET_USER_ID;
const destinationChannelId = process.env.DESTINATION_CHANNEL_ID;

if (!token || !targetUserId || !destinationChannelId) {
    console.error('Missing environment variables. Set DISCORD_TOKEN, TARGET_USER_ID, and DESTINATION_CHANNEL_ID.');
    process.exit(1);
}

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

let destinationChannel;

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    try {
        destinationChannel = await client.channels.fetch(destinationChannelId);
        if (!destinationChannel || !destinationChannel.isTextBased()) {
            throw new Error('Destination channel is not a text channel.');
        }
        console.log(`Using destination channel ${destinationChannel.name} (${destinationChannel.id})`);
    } catch (err) {
        console.error('Failed to fetch destination channel:', err);
        process.exit(1);
    }
});

client.on('messageCreate', async (message) => {
    try {
        if (!message.author) return;
        if (message.author.id !== targetUserId) return;
        if (message.channel.id === destinationChannelId) return; // do not forward from destination channel
        if (message.webhookId) return; // avoid relaying webhooks
        if (message.author.bot) return; // ignore bots

        const content = message.content || '';
        if (!content && message.attachments.size === 0) {
            console.log('No text or attachments to forward for message', message.id);
            return;
        }   

        const responseText = `${content || '[no text content]'}\nStupid + Aden = Staden😂 🫲`;
        await destinationChannel.send(responseText);
        console.log(`Forwarded message ${message.id} from ${message.author.tag} in source channel ${message.channel.id} to destination channel ${destinationChannel.id}`);

        try {
            const botMember = message.guild?.members.cache.get(client.user.id);
            if (botMember && message.channel.permissionsFor(botMember).has('ManageMessages')) {
                await message.delete();
                console.log(`Deleted original message ${message.id} from source channel ${message.channel.id}`);
            } else {
                console.log(`Skipping delete of original message ${message.id}: bot lacks Manage Messages permission in source channel ${message.channel.id}`);
            }
        } catch (deleteErr) {
            console.error(`Could not delete original message ${message.id}:`, deleteErr);
        }
    } catch (err) {
        console.error('Error handling messageCreate:', err);
    }
});

client.login(token).catch(err => {
    console.error('Failed to login:', err);
    process.exit(1);
});