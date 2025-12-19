#!/usr/bin/env node

// Redirect console.log to stderr to avoid interfering with MCP JSON communication
const originalConsoleLog = console.log;
console.log = (...args) => {
  process.stderr.write('[INFO] ' + args.join(' ') + '\n');
};

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  CallToolResult,
  TextContent,
} from '@modelcontextprotocol/sdk/types.js';
import TelegramBot from 'node-telegram-bot-api';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env file
// Try multiple locations: project root, dist directory, and current working directory
const projectRoot = resolve(__dirname, '..');
dotenv.config({ path: resolve(projectRoot, '.env') });
dotenv.config({ path: resolve(__dirname, '.env') });
dotenv.config(); // Fallback to current working directory

// Configuration interface
interface Config {
  telegramBotToken?: string;
  telegramDefaultUser?: string;
  webPort?: number;
}

// Global configuration
// Priority:
// 1. Environment variables from MCP Server configuration (Cursor GUI) - PRIMARY
// 2. .env file in project directory - FALLBACK (for users who don't want Cursor config)
// 3. Runtime updates via web interface API - SECONDARY (for testing/debugging)
let config: Config = {
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  telegramDefaultUser: process.env.TELEGRAM_DEFAULT_USER,
  webPort: parseInt(process.env.WEB_PORT || '3000'),
};

// Log configuration status (masked for security)
console.error(`[INFO] Configuration loaded - Token: ${config.telegramBotToken ? 'YES (' + config.telegramBotToken.length + ' chars)' : 'NO'}, Default User: ${config.telegramDefaultUser || 'NOT SET'}`);

// Telegram bot instance
let bot: TelegramBot | null = null;

// Initialize Telegram bot
function initializeBot(): void {
  // Stop existing bot if it exists
  if (bot) {
// #region agent log
fetch('http://127.0.0.1:7243/ingest/1a750d2b-c3a6-4200-9612-279dbf110e94',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/index.ts:41',message:'Stopping existing bot',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'get-chat-id-fix',hypothesisId:'F'})}).catch(()=>{});
// #endregion
    try {
      bot.stopPolling();
    } catch (err) {
      // Ignore errors when stopping polling
    }
    bot = null;
  }
  
  if (config.telegramBotToken) {
    try {
// #region agent log
fetch('http://127.0.0.1:7243/ingest/1a750d2b-c3a6-4200-9612-279dbf110e94',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/index.ts:50',message:'Initializing bot with polling',data:{hasToken:!!config.telegramBotToken,tokenLength:config.telegramBotToken?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'get-chat-id-fix',hypothesisId:'A'})}).catch(()=>{});
// #endregion
      // Create bot instance without auto-polling first
      bot = new TelegramBot(config.telegramBotToken);
      
// #region agent log
fetch('http://127.0.0.1:7243/ingest/1a750d2b-c3a6-4200-9612-279dbf110e94',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/index.ts:59',message:'Bot instance created',data:{botExists:!!bot},timestamp:Date.now(),sessionId:'debug-session',runId:'get-chat-id-fix',hypothesisId:'A'})}).catch(()=>{});
// #endregion
      
      // Verify bot token is valid first
      bot.getMe().then((botInfo) => {
// #region agent log
fetch('http://127.0.0.1:7243/ingest/1a750d2b-c3a6-4200-9612-279dbf110e94',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/index.ts:66',message:'Bot token verified',data:{botUsername:botInfo.username,botId:botInfo.id},timestamp:Date.now(),sessionId:'debug-session',runId:'get-chat-id-fix',hypothesisId:'A'})}).catch(()=>{});
// #endregion
        console.error(`[INFO] Bot verified: @${botInfo.username} (ID: ${botInfo.id})`);
        
        if (!bot) return;
        
        // Delete any existing webhook before starting polling
        return bot.deleteWebHook();
      }).then(() => {
// #region agent log
fetch('http://127.0.0.1:7243/ingest/1a750d2b-c3a6-4200-9612-279dbf110e94',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/index.ts:71',message:'Webhook deleted, starting polling',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'get-chat-id-fix',hypothesisId:'A'})}).catch(()=>{});
// #endregion
        // Start polling explicitly
        if (!bot) return;
        return bot.startPolling();
      }).then(() => {
// #region agent log
fetch('http://127.0.0.1:7243/ingest/1a750d2b-c3a6-4200-9612-279dbf110e94',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/index.ts:76',message:'Polling started successfully',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'get-chat-id-fix',hypothesisId:'A'})}).catch(()=>{});
// #endregion
        console.error('[INFO] ✅ Polling started successfully - bot is ready to receive /get_chat_id commands');
      }).catch((err: any) => {
// #region agent log
fetch('http://127.0.0.1:7243/ingest/1a750d2b-c3a6-4200-9612-279dbf110e94',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/index.ts:78',message:'Bot token verification failed',data:{error:err.message,code:err.code},timestamp:Date.now(),sessionId:'debug-session',runId:'get-chat-id-fix',hypothesisId:'E'})}).catch(()=>{});
// #endregion
        console.error('[ERROR] Bot token verification failed:', err.message);

        if (err.message.includes('404') || err.message.includes('Not Found')) {
          console.error('[ERROR] ❌ INVALID BOT TOKEN! Please check:');
          console.error('  1. Your bot token format: should be like "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"');
          console.error('  2. The token was copied correctly from @BotFather');
          console.error('  3. The bot wasn\'t deleted or revoked');
          console.error('  4. Try creating a new bot with @BotFather if needed');
        } else if (err.message.includes('401') || err.message.includes('Unauthorized')) {
          console.error('[ERROR] ❌ UNAUTHORIZED! Bot token is invalid or expired.');
        } else if (err.message.includes('network') || err.message.includes('ECONNREFUSED')) {
          console.error('[ERROR] ❌ NETWORK ERROR! Check your internet connection.');
        }

        console.error(`[ERROR] Current token format check: ${config.telegramBotToken ? 'Token provided (' + config.telegramBotToken.length + ' chars)' : 'No token provided'}`);
      });
      
      // Register command handlers BEFORE starting polling
      // Handle /get_chat_id command
      bot.onText(/\/get_chat_id/, (msg) => {
// #region agent log
fetch('http://127.0.0.1:7243/ingest/1a750d2b-c3a6-4200-9612-279dbf110e94',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/index.ts:79',message:'get_chat_id command received',data:{chatId:msg.chat.id,username:msg.chat.username,text:msg.text},timestamp:Date.now(),sessionId:'debug-session',runId:'get-chat-id-fix',hypothesisId:'B'})}).catch(()=>{});
// #endregion
        const chatId = msg.chat.id;
        const chatType = msg.chat.type;
        const username = msg.chat.username || 'N/A';
        
        console.error(`[INFO] 📨 /get_chat_id command received from Chat ID: ${chatId}, Username: @${username}`);
        
        bot?.sendMessage(chatId, `Your Chat ID: \`${chatId}\`\n\nChat Type: ${chatType}\nUsername: @${username}\n\nYou can use this Chat ID in the MCP server configuration.`, {
          parse_mode: 'Markdown'
        }).then(() => {
// #region agent log
fetch('http://127.0.0.1:7243/ingest/1a750d2b-c3a6-4200-9612-279dbf110e94',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/index.ts:52',message:'Chat ID message sent successfully',data:{chatId:chatId},timestamp:Date.now(),sessionId:'debug-session',runId:'get-chat-id-fix',hypothesisId:'B'})}).catch(()=>{});
// #endregion
          console.error(`[INFO] Chat ID sent to user ${chatId} (${username})`);
        }).catch((err) => {
// #region agent log
fetch('http://127.0.0.1:7243/ingest/1a750d2b-c3a6-4200-9612-279dbf110e94',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/index.ts:55',message:'Failed to send chat ID message',data:{error:err.message,chatId:chatId},timestamp:Date.now(),sessionId:'debug-session',runId:'get-chat-id-fix',hypothesisId:'C'})}).catch(()=>{});
// #endregion
          console.error('[ERROR] Failed to send chat ID:', err);
        });
        
        console.error(`[INFO] Chat ID requested by user ${chatId} (${username})`);
      });
      
      // Log all incoming messages to help users find chat IDs
      bot.on('message', (msg) => {
// #region agent log
fetch('http://127.0.0.1:7243/ingest/1a750d2b-c3a6-4200-9612-279dbf110e94',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/index.ts:105',message:'Message event received',data:{chatId:msg.chat.id,text:msg.text?.substring(0,50),isCommand:msg.text?.startsWith('/')},timestamp:Date.now(),sessionId:'debug-session',runId:'get-chat-id-fix',hypothesisId:'D'})}).catch(()=>{});
// #endregion
        if (!msg.text?.startsWith('/get_chat_id')) {
          console.error(`[BOT LOG] 📩 Message from Chat ID: ${msg.chat.id}, Username: @${msg.chat.username || 'N/A'}, Text: ${msg.text?.substring(0, 50) || 'N/A'}`);
        }
      });
      
      // Handle polling errors
      bot.on('polling_error', (error: any) => {
// #region agent log
fetch('http://127.0.0.1:7243/ingest/1a750d2b-c3a6-4200-9612-279dbf110e94',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/index.ts:120',message:'Polling error occurred',data:{error:error?.message || String(error),code:error?.code},timestamp:Date.now(),sessionId:'debug-session',runId:'get-chat-id-fix',hypothesisId:'E'})}).catch(()=>{});
// #endregion
        console.error('[ERROR] Telegram polling error:', error);
      });
      
      // Handle successful polling start
      bot.on('webhook_error', (error) => {
        console.error('[ERROR] Telegram webhook error:', error);
      });
      
      console.error('[INFO] Telegram bot initialized, polling will start after token verification');
      console.error('[INFO] Make sure your bot token is configured via web interface or environment variable');
      console.error('[INFO] Web interface: http://localhost:' + config.webPort);
// #region agent log
fetch('http://127.0.0.1:7243/ingest/1a750d2b-c3a6-4200-9612-279dbf110e94',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/index.ts:130',message:'Bot initialization completed',data:{hasToken:!!config.telegramBotToken},timestamp:Date.now(),sessionId:'debug-session',runId:'get-chat-id-fix',hypothesisId:'A'})}).catch(()=>{});
// #endregion
    } catch (error: any) {
// #region agent log
fetch('http://127.0.0.1:7243/ingest/1a750d2b-c3a6-4200-9612-279dbf110e94',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/index.ts:78',message:'Bot initialization failed',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'get-chat-id-fix',hypothesisId:'E'})}).catch(()=>{});
// #endregion
      console.error('[ERROR] Failed to initialize Telegram bot:', error);
      bot = null;
    }
  } else {
    console.error('[WARN] No Telegram bot token provided. Configure TELEGRAM_BOT_TOKEN in Cursor\'s MCP Servers settings.');
    bot = null;
  }
}

// MCP Server class
class TelegramMCPServer {
  private server: Server;
  private webServer: express.Express;

  constructor() {
    // Initialize Telegram bot
    initializeBot();

    // Create MCP server
    this.server = new Server(
      {
        name: 'telegram-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Set up request handlers
    this.setupRequestHandlers();

    // Initialize web server
    this.webServer = this.createWebServer();
  }

  private setupRequestHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      console.error('[DEBUG] Handling list tools request');
      return {
        tools: [
          {
            name: 'send_telegram_message',
            description: 'Send a message to the default Telegram user configured in .env file.',
            inputSchema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  description: 'The message text to send to the default user configured in .env file',
                },
              },
              required: ['message'],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      console.error('[DEBUG] Handling tool call:', request.params.name);

      const { name, arguments: args } = request.params;

      if (name === 'send_telegram_message') {
        return await this.handleSendTelegramMessage(args);
      }

      throw new Error(`Unknown tool: ${name}`);
    });
  }

  private async handleSendTelegramMessage(args: any): Promise<CallToolResult> {
    console.error('[DEBUG] Handling send_telegram_message with args:', args);

    // Extract message parameter - server handles everything else automatically
    const { message } = args;

    // Validate message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: 'Error: Message is required and must be a non-empty string',
          },
        ],
        isError: true,
      };
    }

    // Ensure bot is initialized - create instance if config exists but bot is null
    if (!bot && config.telegramBotToken) {
      console.error('[INFO] Bot instance missing but token exists, creating bot instance...');
      try {
        bot = new TelegramBot(config.telegramBotToken);
        console.error('[INFO] Bot instance created for message sending');
      } catch (error: any) {
        console.error('[ERROR] Failed to create bot instance:', error.message);
        return {
          content: [
            {
              type: 'text',
              text: `Error: Failed to create bot instance: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    }
    
    // Check if bot is initialized
    if (!bot) {
      const hasToken = !!config.telegramBotToken;
      const hasDefaultUser = !!config.telegramDefaultUser;
      
      let errorMsg = 'Error: Telegram bot is not initialized.';
      if (!hasToken) {
        errorMsg += ' Please configure TELEGRAM_BOT_TOKEN via web interface or .env file.';
      } else if (!hasDefaultUser) {
        errorMsg += ' Bot token is configured but TELEGRAM_DEFAULT_USER is missing. Please configure it via web interface or .env file.';
      } else {
        errorMsg += ' Bot token and default user are configured, but bot initialization failed. Check server logs for details.';
      }
      
      return {
        content: [
          {
            type: 'text',
            text: errorMsg,
          },
        ],
        isError: true,
      };
    }

    // Use the default user from .env file automatically
    const recipient = config.telegramDefaultUser;

    if (!recipient) {
      return {
        content: [
          {
            type: 'text',
            text: 'Error: No default user configured. Please set TELEGRAM_DEFAULT_USER in the .env file.',
          },
        ],
        isError: true,
      };
    }

    console.error(`[DEBUG] Using default user from .env: ${recipient}`);

    // At this point, recipient is guaranteed to be defined
    if (!recipient) {
      return {
        content: [
          {
            type: 'text',
            text: 'Error: Failed to determine recipient.',
          },
        ],
        isError: true,
      };
    }

    try {
      console.error(`[INFO] Sending message to ${recipient}: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`);

      // Send message via Telegram bot
      await bot.sendMessage(recipient, message);

      console.error('[INFO] Message sent successfully');
      return {
        content: [
          {
            type: 'text',
            text: `Message sent successfully to ${recipient}`,
          },
        ],
      };
    } catch (error: any) {
      console.error('[ERROR] Failed to send message:', error.message);

      // Provide more helpful error messages for common Telegram issues
      let errorMessage = `Error sending message: ${error.message}`;

      if (error.message.includes('chat not found')) {
        if (recipient.startsWith('@')) {
          errorMessage = `Cannot send message to username "${recipient}". Telegram bots can only message users who have started a conversation with the bot first. Try using a chat ID instead, or have the user start a chat with your bot.`;
        } else {
          errorMessage = `Chat not found for ID "${recipient}". Please verify the chat ID is correct.`;
        }
      } else if (error.message.includes('bot was blocked by the user')) {
        errorMessage = `The user has blocked your bot. They need to unblock the bot to receive messages.`;
      } else if (error.message.includes('user is deactivated')) {
        errorMessage = `The user account has been deactivated.`;
      }

      return {
        content: [
          {
            type: 'text',
            text: errorMessage,
          },
        ],
        isError: true,
      };
    }
  }

  private createWebServer(): express.Express {
    const app = express();

    // Middleware
    app.use(express.json());
    app.use(express.static(path.join(__dirname, '../public')));

    // API Routes
    app.get('/api/config', (req, res) => {
      res.json({
        telegramBotToken: config.telegramBotToken ? (config.telegramBotToken.substring(0, 10) + '...' + config.telegramBotToken.substring(config.telegramBotToken.length - 5)) : null,
        telegramBotTokenConfigured: !!config.telegramBotToken,
        telegramDefaultUser: config.telegramDefaultUser || null,
        webPort: config.webPort,
      });
    });

    app.post('/api/config', (req, res) => {
      const { telegramBotToken, telegramDefaultUser } = req.body;

      // Note: Runtime updates via web interface are for testing/debugging only.
      // Primary configuration should be set via MCP Server environment variables in Cursor.
      if (telegramBotToken !== undefined) {
        config.telegramBotToken = telegramBotToken;
        // Reinitialize bot with new token
        initializeBot();
      }

      if (telegramDefaultUser !== undefined) {
        config.telegramDefaultUser = telegramDefaultUser;
      }

      res.json({ success: true, message: 'Configuration updated (runtime only - use MCP Server settings for persistent config)' });
    });

    app.post('/api/test', async (req, res) => {
      const { message, chatId, username } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      try {
        const result = await this.handleSendTelegramMessage({ message, chatId, username });
        const content = result.content[0];
        const messageText = content.type === 'text' ? content.text : 'Unknown response type';
        return res.json({
          success: !result.isError,
          message: messageText,
        });
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }
    });

    app.get('/api/status', (req, res) => {
      // Check if bot is actually polling
      let pollingStatus = 'unknown';
      if (bot) {
        try {
          // Try to check if polling is active (this is a best-effort check)
          pollingStatus = 'initialized';
        } catch (e) {
          pollingStatus = 'error';
        }
      } else {
        pollingStatus = 'not initialized';
      }
      
      res.json({
        server: 'running',
        bot: pollingStatus,
        config: {
          hasToken: !!config.telegramBotToken,
          hasDefaultUser: !!config.telegramDefaultUser,
          tokenPreview: config.telegramBotToken ? (config.telegramBotToken.substring(0, 10) + '...') : null,
        },
        pollingActive: bot ? 'yes' : 'no',
      });
    });

    return app;
  }

  async start(): Promise<void> {
    console.error('[INFO] Starting Telegram MCP Server...');

    // Start web server
    this.webServer.listen(config.webPort, () => {
      console.error(`[INFO] Web interface available at http://localhost:${config.webPort}`);
    });

    // Start MCP server
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('[INFO] MCP server connected and ready');
  }
}

// Main execution
async function main() {
  try {
    const server = new TelegramMCPServer();
    await server.start();
  } catch (error) {
    console.error('[ERROR] Failed to start server:', error);
    process.exit(1);
  }
}

main();
