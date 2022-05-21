import { Client, Intents, MessageEmbed } from "discord.js";
import { Log, React } from "./src/utils";
import dotenv from "dotenv";
import { searchBookByTitle } from "./src/skoobTools";
dotenv.config();

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
});

const allowedChannels = ["807379660781518918", "773115470270169090"];
const commands = ["!livro"];

client.on("ready", () => {
  console.log("Conectado!");
});

client.login(<string>process.env.DISCORD_TOKEN);

client.on("messageCreate", async message => {
  if (message.author.bot) return;
  Log(message);

  if (commands.includes(message.content.split(" ")[0]) && allowedChannels.includes(message.channelId)) {
    const reactions = ["1️⃣", "2️⃣", "3️⃣"];
    const command = message.content.split(" ")[0];
    const args: string | string[] = message.content.split(" ");
    args.shift();
    if (command === "!livro") {
      if (args.length === 0) {
        message.reply("Por favor, digite o nome do livro que deseja procurar.");
        return;
      }
      await message.channel.sendTyping();

      const title = args.join(" ");

      const start = performance.now();
      const books = await searchBookByTitle(title);
      const end = performance.now();

      const time = end - start;
      console.log("Tempo de execução comando !livro: " + time / 1000 + "s");

      if (books.length === 0) {
        await message.reply("Não encontrei nenhum livro com esse título. :cry: ");
        return;
      }
      if (books.length === 1) {
        const book = books[0];
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
          })
          .finally(() => {
            return;
          });
      }
      if (books.length > 1) {
        reactions.length = books.length;
        const embeddedMessage = new MessageEmbed()
          .setColor("#006529")
          .setTitle(`${books.length} Livros encontrados`)
          .setDescription(`Use as reações ${reactions.join(" ")} para selecionar o livro desejado.`)
          .setTimestamp(new Date())
          .setFooter({ text: "Feito por @rapoxo", iconURL: "https://avatars.githubusercontent.com/u/69836442?s=460&v=4" })
          .setFields(books.map((book: any, index: number) => ({ name: `${reactions[index]}`, value: `${book.titulo}` })));
        const response = await message.channel.send({ embeds: [embeddedMessage] });
        await React(response, reactions);
        const filter = (reaction: any, user: any) => reactions.includes(reaction.emoji.name) && user.id === message.author.id;

        response
          .awaitReactions({ filter, max: 1, time: 60000, errors: ["time"] })
          .then(async (collected: any) => {
            const reaction = collected.first();
            const book = books[reactions.indexOf(reaction.emoji.name)];
            /* Refatorar */
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
              })
              .finally(() => {
                return;
              });
            /* Refatorar */
          })
          .catch(async () => {
            await response.delete();
            message.reply("Tempo limite atingido");
          })
          .finally(async () => {
            return await response.delete();
          });
      }
    }
  }
});
