# Discord.js v14 Ticket Bot

A complete Discord ticket system bot built with Discord.js v14 and Slash Commands.

## Setup Guide

1. **Install Node.js**: Ensure you have Node.js version 16.11.0 or higher.
2. **Install Dependencies**:
   Open a terminal in this directory and run:
   ```bash
   npm install
   ```
3. **Configure the Bot**:
   Open the `.env` file and fill in your details:
   - `TOKEN`: Your Discord bot token.
   - `CLIENT_ID`: Your bot's application ID.
   - `GUILD_ID`: The ID of your Discord server.
   - `LOG_CHANNEL_ID`: The ID of the channel where you want ticket logs to be sent.
   
   The role, category, and panel channel IDs have been pre-configured per your request.
4. **Start the Bot**:
   ```bash
   npm start
   ```
   
Once started, the bot will register slash commands and be ready to use!
