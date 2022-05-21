import type { SkoobResponse, SearchResult, SkoobBookType } from "./models/SkoobResponse";
import { createBookEmbed } from "./embed";
import { Book, User } from "./models";
import { insertBook, searchBook } from "./mongoTools";
import * as cheerio from "cheerio";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const amazonTag = <string>process.env.amazon_tag;
const config = {
  headers: {
    Cookie: <string>process.env.SKOOB_AUTH,
  },
};

const skoobSearch = async (query: string): Promise<Book[]> => {
  const response = await axios.get<any>(`https://www.skoob.com.br/search/v1?q=${encodeURI(query)}&limit=3`);
  const books: any[] = response.data.results;
  const titles = books.map(book => book.titulo);
  
  if ([...new Set(titles)].length === 1) {
    return [await getBookById(<string>books[0].id)];
  }

  return await Promise.all(
    books.map(async (book: any) => {
      console.log(book);
      return await getBookById(book.id);
    })
  );
};

const skoobFetch = async (route: string) => {
  try {
    const response = await axios.get<SkoobResponse>(`https://www.skoob.com.br/v1/${route}`, config);
    return response.data.response;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const getBookISBN = async (skoobURL: string): Promise<string[] | null> => {
  try {
    const page = await axios.get(`https://skoob.com.br${skoobURL}`, { responseEncoding: "binary" });
    const $ = cheerio.load(page.data.toString("ISO-8859-1"));
    const isbn: string[] = [];
    $("div[class='sidebar-desc']")
      .children()
      .each((i, el) => {
        const text = $(el).text();
        if (text) {
          isbn.push(text);
        }
      });
    if (isbn.length >= 3) isbn.pop();
    return isbn.length >= 2 ? isbn : null;
  } catch (err) {
    console.log(err);
    return null;
  }
};

const getAmazonUrl = async (isbn: string[] | null) => {
  if (!isbn) return null;
  return `https://amazon.com.br/dp/${isbn[1]}?tag=${amazonTag}`;
};

const searchBookByTitle = async (title: string): Promise<Book[]> => {
  const books = await skoobSearch(title);

  /* return [{ ...books[0], embeddedMessage: await createBookEmbed(books[0]) }]; */
  return await Promise.all(books.map(async book => ({ ...book, embeddedMessage: await createBookEmbed(book) })));
};

const getBookById = async (bookID: string): Promise<Book> => {
  const book = await searchBook(bookID);

  if (book) return { ...book, embeddedMessage: await createBookEmbed(book) };
  const response = await skoobFetch(`book/${bookID}`);
  let { id, livro_id, titulo, subtitulo, ano, paginas, autor, sinopse, editora, leitores, capa_grande, url } = response;

  const isbn = await getBookISBN(url);
  const amazon_url = await getAmazonUrl(isbn);
  if (sinopse.length > 300) sinopse = sinopse.substring(0, 300);

  const newBook: Book = {
    skoob_id: id.toString(),
    livro_id: livro_id.toString(),
    titulo,
    subtitulo,
    ano,
    paginas,
    autor,
    sinopse: sinopse.trim(),
    editora,
    leitores,
    isbn_10: isbn ? isbn[0] : null,
    isbn_13: isbn ? isbn[1] : null,
    skoob_url: url,
    amazon_url,
    capa: capa_grande,
  };
  await insertBook({ ...newBook, embeddedMessage: await createBookEmbed(newBook) });
  return { ...newBook, embeddedMessage: await createBookEmbed(newBook) };
};

const getUser = async (userID: string): Promise<User> => {
  const response = await skoobFetch(`user/${userID}`);
  const { id, nome, apelido, foto, skoob } = response;
  return { skoob_id: id.toString(), nome, apelido, skoob, foto };
};

export { skoobFetch, skoobSearch, getUser, getBookById, searchBookByTitle };
