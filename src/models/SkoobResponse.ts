import type Book from "../models/Book";

type SearchResult = {
  results: SkoobBookType[];
};

interface SkoobBookType extends Book {
  capa_grande: string;
  tipo: number;
  url: string;
  favorito: 0 | 1;
}

type SkoobResponse = {
  success: boolean;
  response: any;
  logged_id?: number;
  modified?: string;
};

export { SkoobResponse, SearchResult, SkoobBookType };
