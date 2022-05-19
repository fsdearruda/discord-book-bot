import { Client, Intents } from "discord.js";
import { Log, React } from "./src/utils";
import dotenv from "dotenv";
import { getBook } from "./src/skoobTools";
dotenv.config();

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
});

const allowedChannels = ["807379660781518918", "773115470270169090"];
const commands = ["!livro"];

client.on("ready", () => {
  console.log("Conectado!");
});

client.login(process.env.DISCORD_TOKEN);

client.on("messageCreate", async message => {
  if (message.author.bot) return;
  Log(message);

  if (commands.includes(message.content.split(" ")[0]) && allowedChannels.includes(message.channelId)) {
    const command = message.content.split(" ")[0];
    const args: string | string[] = message.content.split(" ");
    args.shift();

    if (command === "!livro") {
      const title = args.join(" ");
      const book = await getBook(title);
      const response = await message.channel.send({ embeds: [book.embeddedMessage] });
      await React(response, ["✅", "❌"]);
      const filter = (reaction: any, user: any) => ["✅", "❌"].includes(reaction.emoji.name) && user.id === message.author.id;
      response
        .awaitReactions({ filter, max: 1, time: 60000, errors: ["time"] })
        .then(async (collected: any) => {
          const reaction = collected.first();

          if (reaction.emoji.name === "✅") {
            response.pin();
            message.reply("Sua indicação foi adicionada à lista");
          } else if (reaction.emoji.name === "❌") {
            await response.delete();
            message.reply("Indicação não incluída à lista");
          }
        })
        .catch(async () => {
          await response.delete();
          message.reply("Tempo limite atingido");
        });
    }
  }
});
