import type { Message } from "discord.js";

export default (message: Message) => {
  let date = new Date(message.createdTimestamp).toLocaleTimeString("pt-BR");
  console.log(`<${message.author.username} ${message.author.bot ? "BOT" : "USER"} ${message.channelId} [${date}]> ${message.content} ${message.pinned ? "📌" : ""}`);
};
