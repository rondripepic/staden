# Staden bot

A minimal Discord listener that forwards messages from a specific user to a fixed destination text channel.

## Full setup guide

### 1. Create the Discord application and add a bot

1. Open the Discord Developer Portal: https://discord.com/developers/applications
2. Click `New Application`
3. Give it a name and create it
4. In the left menu, go to `Bot`
5. Click `Add Bot`
6. Confirm
7. Copy the bot token from the Bot page
8. Enable **Message Content Intent** on the Bot page and save changes

### 2. Invite the bot to your server

1. In the Developer Portal, go to `OAuth2` → `URL Generator`
2. Under `SCOPES`, select `bot`
3. Under `BOT PERMISSIONS`, select:
   - `View Channels`
   - `Read Messages/View Channels`
   - `Send Messages`
   - `Read Message History`
4. Copy the generated invite URL
5. Open the URL in your browser and invite the bot to the server

### 3. Choose the destination channel

This script now forwards copied messages into a single destination text channel instead of using a webhook.

1. Open the channel in Discord where you want the bot to post copied messages.
2. Enable Developer Mode in Discord settings if you need the channel ID.
3. Right-click the channel and choose `Copy ID`.
4. Use that ID for `DESTINATION_CHANNEL_ID`.

### 4. Configure the project

Create environment variables for the bot token, user ID, and destination channel ID.

Using the shell temporarily:

```bash
export DISCORD_TOKEN="PASTE_BOT_TOKEN_HERE" 
export TARGET_USER_ID=PASTE_TARGET_USER_NUMBER_HERE
export DESTINATION_CHANNEL_ID=PASTE_TARGET_CHANNEL_NUMBER_HERE
```

make sure that the discord token is in quotes

Or use a `.env` file (preferred for local use):

```bash
DISCORD_TOKEN=PASTE_BOT_TOKEN_HERE
TARGET_USER_ID=PASTE_TARGET_USER_NUMBER_HERE
DESTINATION_CHANNEL_ID=PASTE_TARGET_CHANNEL_NUMBER_HERE
```

### 5. Install dependencies

Run inside the project folder:

```bash
npm install
```

### 6. Run the bot

From the project folder:

```bash
npm start
```

If you are not using `npm start`, you can run:

```bash
node staden.js
```

### 7. Test it

1. Have the target user send a message in a channel the bot can read.
2. The bot should detect that user and post the message to the destination channel.
3. The bot will append `Stupid + Aden = Staden😂 🫲` to the copied text.
4. Check the terminal for logs like:
   - `Logged in as ...`
   - `Forwarded message ... from ... to destination channel ...`

### Permission requirements

- The bot must have `Read Messages/View Channels` and `Send Messages` in the source and destination channels.
- If you want the bot to delete the original message after forwarding it, also give it `Manage Messages` in the source channel.

## Important notes

- Do not commit `DISCORD_TOKEN` to source control.
- If the token is leaked, regenerate it on the Developer Portal.
- The bot must be invited to the server as a bot account.
- The webhook must exist in the destination channel.
- `TARGET_USER_ID` must be the exact Discord user ID of the user whose messages you want to forward.

## Files

- `staden.js` — the bot listener and forwarder
- `package.json` — project metadata and start script
- `.env.example` — sample environment configuration

## Optional: direct bot reposting instead of webhook forwarding

If you want the bot to repost directly into the same channel instead of sending through a webhook, I can update `staden.js` to use `message.channel.send(...)`.
