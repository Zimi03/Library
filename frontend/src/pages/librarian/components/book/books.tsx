import { useEffect, useState } from "react";
import client from "../../../../utils/axiosClient.ts";
import AddBookModal from "./modal/addBook.tsx";
import notification from "../../../../utils/notify.ts";
import { AxiosError, AxiosResponse } from "axios";

export interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  status: "dostępna" | "niedostępna";
}

const getAllBooks = async (): Promise<Book[]> => {
  const response = await client.get("/books");
  return response.data;
};

const Books = () => {
  const [books, setBooks] = useState<Book[]>([
    // {
    //   title: "Mock Book Title",
    //   author: "Mock Author",
    //   genre: "Mock Genre",
    //   status: "dostępna",
    // },
    // {
    //   title: "Mock Book Title",
    //   author: "Mock Author",
    //   genre: "Mock Genre",
    //   status: "dostępna",
    // },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchBooks = async () => {
    const booksData = await getAllBooks();
    console.log(booksData);
    setBooks(booksData);
  };

  useEffect(() => {
    fetchBooks();
  }, []);
  const deleteBook = async (id: number) => {
    return await client.post("/deleteBook", { copy_id: id });
  };

  const handleAddBook = (newBook: Book) => {
    client
      .post("/addBook", {
        title: newBook.title,
        author: newBook.author,
        genre: newBook.genre,
      })
      .then((res: AxiosResponse) => {
        fetchBooks();
        notification("top-center", res.data.message, "success", "dark");
      })
      .catch((error: AxiosError) => {
        notification("top-center", error.message, "error", "dark");
      });
  };

  return (
    <main className="flex flex-col gap-5 h-full w-full">
      <nav className="flex flex-row-reverse items-center content-center">
        <button
          className="flex content-center justify-center text-center rounded-md bg-gray-800 hover:bg-gray-700"
          onClick={() => setIsModalOpen(true)}
        >
          <p className="p-5">Add book</p>
        </button>
      </nav>
      <section className="h-5/6 rounded-md w-full bg-gray-600 p-4">
        <ul className="h-full overflow-auto">
          {books.map((book, index) => (
            <li
              key={index}
              className="mb-2 p-2 border-b border-gray-400 bg-gray-500 rounded-md flex justify-between items-center"
            >
              <div>
                <h2 className="text-lg font-bold">{book.title}</h2>
                <p>Author: {book.author}</p>
                <p>Genre: {book.genre}</p>
              </div>

              <button
                type="submit"
                className={`right-0 text-red-600 float-right text-lg font-bold ml-auto h-full w-44 p-2 rounded-md hover:bg-gray-500 ${
                  book.status !== "niedostępna" ? "flex" : "hidden"
                }`}
                onClick={async () =>
                  await deleteBook(book.id)
                    .then((res: AxiosResponse) => notification("top-center", res.data.message, "success", "dark"))
                    .catch((error: AxiosError) => notification("top-center", error.message, "error", "dark"))
                }
              >
                Delete
              </button>
              <p className={`text-lg font-bold ${book.status !== "niedostępna" ? "text-green-500" : "text-red-500"}`}>
                {book.status}
              </p>
            </li>
          ))}
          {books.length === 0 && <p className="text-center text-lg font-bold">No books found</p>}
        </ul>
      </section>
      <AddBookModal show={isModalOpen} handleClose={() => setIsModalOpen(false)} handleAddBook={handleAddBook} />
    </main>
  );
};

export default Books;
