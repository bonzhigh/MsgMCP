# Telegram MCP Server

> **⚠️ Disclaimer**: This project contains AI-generated code that has not been thoroughly tested. Use at your own risk and verify all functionality before production deployment.

A Model Context Protocol (MCP) server that enables AI assistants to send messages to Telegram users. Features a web-based configuration interface and supports both chat IDs and usernames.

## Features

- **MCP Tool**: `send_telegram_message` tool for AI assistants
- **Default User Support**: Send messages to a configured default user when no recipient is specified
- **Web Interface**: Easy configuration and testing via web browser
- **Flexible Recipients**: Support for both Telegram chat IDs and usernames
- **Real-time Status**: Live status monitoring of server and bot configuration

## Prerequisites

- Node.js 18 or higher
- A Telegram bot token from [@BotFather](https://t.me/BotFather)

## Quick Start

### 1. Create a Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Start a chat and send the command `/newbot`
3. Follow the prompts to:
   - Choose a name for your bot
   - Choose a username for your bot (must end with `bot`)
4. Copy the API token provided by BotFather

### 2. Install and Configure

```bash
# Clone or download this repository
git clone <repository-url>
cd telegram-mcp-server

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env file with your bot token
# TELEGRAM_BOT_TOKEN=your_bot_token_here
```

### 3. Start the Server

```bash
# Start the server
npm start
```

The web interface will be available at `http://localhost:3000`

### 4. Configure via Web Interface

1. Open `http://localhost:3000` in your browser
2. Enter your bot token in the configuration section
3. Optionally set a default user (chat ID or username)
4. Click "Save Configuration"

### 5. Test the Bot

1. In the web interface, go to the "Test Message Sending" section
2. Enter a test message
3. Optionally specify a recipient (leave empty to test default user)
4. Click "Send Test Message"

## Configuration

### Primary Configuration: MCP Servers GUI (Recommended)

**Configuration should be managed through Cursor's MCP Servers settings:**

1. Open Cursor Settings (`Ctrl+,` or `Cmd+,`)
2. Search for "MCP" or navigate to MCP Servers settings
3. Add or edit the `telegram` server configuration
4. Set environment variables:
   - `TELEGRAM_BOT_TOKEN` (required): Your bot token from @BotFather
   - `TELEGRAM_DEFAULT_USER` (optional): Default chat ID or username for messages

**Configuration Priority:**
1. **Primary**: Environment variables from MCP Server configuration (Cursor GUI) - used at startup
2. **Secondary**: Runtime updates via web interface API - for testing/debugging only

**Stored Values as Defaults:**
- When tool calls don't provide `chatId` or `username`, the stored `TELEGRAM_DEFAULT_USER` is used automatically
- If `TELEGRAM_DEFAULT_USER` is not configured and no recipient is provided, an error is returned

### Web Interface Configuration (Testing/Debugging)

The web interface (`http://localhost:3000`) allows runtime configuration changes for testing:

- **Bot Token**: Enter your Telegram bot token (runtime only)
- **Default User**: Set a fallback recipient when no user is specified in messages
  - Use chat ID (numeric) for reliability
  - Username can be used but requires the user to have started your bot

⚠️ **Note**: Web interface configuration is temporary and for testing purposes. For persistent configuration, use Cursor's MCP Servers GUI.

### Legacy: Environment Variables File

For standalone usage (not via MCP), you can create a `.env` file:

```env
# Required: Your bot token from BotFather
TELEGRAM_BOT_TOKEN=your_bot_token_here

# Optional: Default user for messages (chat ID or username)
TELEGRAM_DEFAULT_USER=123456789

# Optional: Web interface port (default: 3000)
WEB_PORT=3000
```

## Usage with MCP Clients

### Connecting to Cursor

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Configure in Cursor's MCP Servers GUI:**
   - Open Cursor Settings (`Ctrl+,` or `Cmd+,`)
   - Search for "MCP Servers" or navigate to MCP settings
   - Add a new server or edit existing:
     - **Name**: `telegram`
     - **Command**: `node`
     - **Arguments**: `C:\AppDev\Projects\MsgMCP\dist\index.js` (use your full path)
     - **Environment Variables**:
       - `TELEGRAM_BOT_TOKEN`: Your bot token from @BotFather
       - `TELEGRAM_DEFAULT_USER`: (Optional) Default chat ID or username

3. **Restart Cursor** for changes to take effect

### Cursor AI Notification Rule

**Purpose**: Ensure the user is promptly notified whenever user intervention is required.

**Triggers**:
- Completion of the process with a success message
- Any unexpected halts or issues in the process
- When Cursor AI requires user input or has questions

**Action**: Utilize `send_telegram_message` tool to send a detailed Telegram message to the user.

### Connecting to Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "telegram": {
      "command": "node",
      "args": ["/path/to/telegram-mcp-server/dist/index.js"],
      "env": {
        "TELEGRAM_BOT_TOKEN": "your_bot_token_here",
        "TELEGRAM_DEFAULT_USER": "your_default_user"
      }
    }
  }
}
```

### Using the Tool

The server provides one MCP tool: `send_telegram_message`

#### Parameters

- `message` (required): The text message to send to the default user

#### Examples

**Send to default user:**
```
Send a message saying "Hello from AI!"
```

The tool automatically sends to the `TELEGRAM_DEFAULT_USER` configured in the `.env` file. No recipient specification needed!

**Simple usage:**
```
Tell the user that the task is complete
```
```
Notify that the server is running
```

## API Endpoints

The server exposes a REST API for configuration and testing:

### GET /api/status
Get server and bot status information.

**Response:**
```json
{
  "server": "running",
  "bot": "initialized",
  "config": {
    "hasToken": true,
    "hasDefaultUser": true
  }
}
```

### GET /api/config
Get current configuration (masked for security).

**Response:**
```json
{
  "telegramBotToken": "configured",
  "telegramDefaultUser": "123456789",
  "webPort": 3000
}
```

### POST /api/config
Update configuration.

**Request:**
```json
{
  "telegramBotToken": "new_token_here",
  "telegramDefaultUser": "new_default_user"
}
```

### POST /api/test
Send a test message.

**Request:**
```json
{
  "message": "Test message",
  "chatId": "123456789",
  "username": "@testuser"
}
```

## Development

### Build

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

### Run Web Interface Only

```bash
npm run web
```

## Troubleshooting

### Bot Not Sending Messages

1. **Check Bot Token**: Ensure your bot token is correct and the bot is not revoked
2. **User Interaction**: For username-based sending, the user must have started your bot first
3. **Chat ID vs Username**: Use chat IDs for more reliable message delivery

### Web Interface Not Loading

1. **Port Conflict**: Check if port 3000 is available
2. **Firewall**: Ensure the port is not blocked by firewall
3. **Environment**: Verify Node.js version and dependencies

### MCP Connection Issues

1. **Path**: Ensure the path to `dist/index.js` is correct in your MCP client config
2. **Environment Variables**: Make sure required environment variables are set
3. **Build**: Ensure the project is built (`npm run build`) before connecting

## Security Considerations

- Store bot tokens securely and never commit them to version control
- The web interface is intended for local configuration only
- Consider additional authentication for production deployments
- Bot tokens have full access to your bot - keep them confidential

## License

[MIT License](LICENSE)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions:

1. Check the troubleshooting section above
2. Review the [Telegram Bot API documentation](https://core.telegram.org/bots/api)
3. Check [MCP documentation](https://modelcontextprotocol.io/) for client integration

## Changelog

### v1.0.0
- Initial release
- MCP server with Telegram messaging tool
- Web-based configuration interface
- Support for chat IDs and usernames
- Default user fallback functionality
