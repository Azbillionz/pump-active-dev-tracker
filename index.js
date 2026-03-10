const TelegramBot = require("node-telegram-bot-api");
const WebSocket = require("ws");
const { BOT_TOKEN, CHAT_ID, SOLANA_RPC } = require("./config");

console.log("RPC URL:", SOLANA_RPC);

// Validate all required environment variables
if (!SOLANA_RPC) {
    console.error("ERROR: SOLANA_RPC is missing");
    process.exit(1);
}
if (!BOT_TOKEN) {
    console.error("ERROR: BOT_TOKEN is missing");
    process.exit(1);
}
if (!CHAT_ID) {
    console.error("ERROR: CHAT_ID is missing");
    process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: false });
console.log("Starting Pump tracker...");

let ws = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_DELAY = 5000; // 5 seconds

function connectWebSocket() {
    try {
        ws = new WebSocket(SOLANA_RPC);

        ws.on("open", () => {
            console.log("Connected to WebSocket");
            reconnectAttempts = 0; // Reset on successful connection
        });

        ws.on("message", (data) => {
            try {
                const parsed = JSON.parse(data);
                if (parsed) {
                    const message = NEW SOLANA EVENT DETECTED\n\nRaw Data:\n${JSON.stringify(parsed).slice(0, 500)};
                    bot.sendMessage(CHAT_ID, message).catch((err) => {
                        console.error("Failed to send Telegram message:", err.message);
                    });
                    console.log("Message sent to Telegram");
                }
            } catch (err) {
                console.log("Parse error:", err.message);
            }
        });

        ws.on("error", (err) => {
            console.error("WebSocket error:", err.message);
        });

        ws.on("close", () => {
            console.log("WebSocket connection closed");
            reconnect();
        });
    } catch (err) {
        console.error("Failed to create WebSocket:", err.message);
        reconnect();
    }
}

function reconnect() {
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        console.log(Attempting to reconnect... (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}) in ${RECONNECT_DELAY}ms);
        setTimeout(() => {
            connectWebSocket();
        }, RECONNECT_DELAY);
    } else {
        console.error("Max reconnection attempts reached. Exiting...");
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on("SIGTERM", () => {
    console.log("SIGTERM received, shutting down gracefully...");
    if (ws) ws.close();
    process.exit(0);
});
process.on("SIGINT", () => {
    console.log("SIGINT received, shutting down gracefully...");
    if (ws) ws.close();
    process.exit(0);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    process.exit(1);
});

// Start the bot
connectWebSocket();
