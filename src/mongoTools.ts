import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { getUser } from "./skoobTools";
import { User, Book } from "./models";
dotenv.config();

const client = new MongoClient(<string>process.env.mongo_uri);

client.connect().then(() => {
  console.log("Connected to MongoDB");
});

const database = client.db("discord");

export const searchBook = async (bookId: string) => {
  const book = await database.collection("books").findOne<Book>({ skoob_id: bookId });
  return book;
};

export const insertBook = async (book: Book): Promise<void> => {
  const exists = await searchBook(book.skoob_id);
  if (!exists) {
    await database.collection("books").insertOne(book);
  }
};

export const searchUser = async (userId: string) => {
  const user = await database.collection("users").findOne<User>({ skoob_id: userId });
  return user;
};

export const insertUser = async (userId: string): Promise<void> => {
  const user = await searchUser(userId);
  if (!user) {
    const newUser = await getUser(userId);
    await database.collection("users").insertOne(newUser);
  }
};

export const deleteUser = async (userId: string): Promise<Boolean> => {
  const deleteResult = await database.collection("users").deleteOne({ skoob_id: userId });
  return deleteResult.deletedCount === 1;
};
