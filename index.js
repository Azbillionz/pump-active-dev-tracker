const TelegramBot = require("node-telegram-bot-api")
const WebSocket = require("ws")
const { BOT_TOKEN, CHAT_ID, SOLANA_RPC } = require("./config")

const bot = new TelegramBot(BOT_TOKEN, { polling:false })

console.log("Starting Pump tracker...")

const ws = new WebSocket(SOLANA_RPC)

ws.on("open", () => {
console.log("Connected to Helius WebSocket")
})

ws.on("message", (data) => {
try{

const parsed = JSON.parse(data)

if(parsed){
const message = `NEW SOLANA EVENT DETECTED

Raw Data:
${JSON.stringify(parsed).slice(0,500)}
`

bot.sendMessage(CHAT_ID,message)

console.log("Message sent to Telegram")

}

}catch(err){
console.log("Parse error")
}

})

ws.on("error", err=>{
console.log("Websocket error:",err)
})

ws.on("close",()=>{
console.log("Connection closed")
})
