interface Book {
  skoob_id: string;
  livro_id: string;
  titulo: string;
  subtitulo: string;
  ano: number;
  paginas: number;
  autor: string;
  sinopse: string;
  editora: string;
  leitores: number;
  nota?: string | null;
  capa: string;
  skoob_url: string;
  isbn_10?: string | null;
  isbn_13?: string | null;
  amazon_url?: string | null;
  embeddedMessage?: any;
}

export default Book;
