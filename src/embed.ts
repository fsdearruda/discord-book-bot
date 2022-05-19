import { MessageEmbed } from "discord.js";
import getColors from "get-image-colors";
import axios from "axios";
import { Book } from "./models";
import * as cheerio from "cheerio";

const getThumbnailColor = async (url: string): Promise<any> => {
  return new Promise(async resolve => {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
    });
    const image = Buffer.from(response.data, "base64");
    getColors(image, "image/jpg").then(colors => {
      resolve(colors[0].hex());
    });
  });
};

const getBookRating = async (book: Book): Promise<string | null> => {
  try {
    const page = await axios.get(`https://skoob.com.br${book.skoob_url}`, { responseEncoding: "binary" });
    const $ = cheerio.load(page.data.toString("ISO-8859-1"));

    let rating = $("span[class='rating']").text();
    console.log("AQUI AQUI AQUI");
    console.log(rating);
    return rating;
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const createBookEmbed = (book: Book): Promise<any> => {
  return new Promise(async resolve => {
    // const placeholders = { thumbnail: "https://i.imgur.com/Rboh7Ys.png", color: "#6632a8" } Roxinho
    const placeholders = { thumbnail: "https://i.imgur.com/cmTtDd1.png", color: "#314560" }; // Azul
    const details = {
      color: book.capa != null ? await getThumbnailColor(book.capa) : placeholders.color,
      thumbnail: book.capa != null ? book.capa : placeholders.thumbnail,
    };

    const nota = await getBookRating(book);

    const embeddedMessage = new MessageEmbed()
      .setColor(details.color)
      .setTitle(book.titulo)
      .setDescription(
        `${
          book.sinopse ? `${book.sinopse}${book.amazon_url ? ` [...ver mais](${book.amazon_url})` : null} \n\n` : ""
        }Deseja adicionar este livro às suas indicações?\n\n✅ Sim  ❌ Não`
      )
      .setURL(book.amazon_url ?? "")
      .setThumbnail(details.thumbnail)
      .setFields(
        {
          name: "Autor",
          value: book.autor,
          inline: true,
        },
        {
          name: "Nota",
          value: `${nota ? `⭐ ${nota}/5` : "N/A"} `,
          inline: true,
        },
        {
          name: "Páginas",
          value: `${book.paginas !== null ? book.paginas.toString() : "N/A"}`,
          inline: true,
        },
        {
          name: "Publicação",
          value: `${book.ano !== null ? book.ano.toString() : "N/A"}`,
          inline: true,
        }
      )
      .setFooter({ text: "Feito por @rapoxo", iconURL: "https://avatars.githubusercontent.com/u/69836442?s=460&v=4" })
      .setTimestamp(new Date());
    resolve(embeddedMessage);
  });
};
