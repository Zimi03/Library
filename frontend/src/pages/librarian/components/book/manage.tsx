import client from "../../../../utils/axiosClient.ts";
import { useEffect, useState } from "react";
import { Book } from "./books.tsx";
import notification from "../../../../utils/notify.ts";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

const getBooks = async () => {
  const response = await client.get("/books");
  return response.data;
};

const Manage = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [username, setUsername] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [book, setBook] = useState<string>("");
  const [action, setAction] = useState<boolean>(true);

  const navigate = useNavigate();
  useEffect(() => {
    const fetchBooks = async () => {
      const booksData = await getBooks();
      setBooks(booksData);
    };
    const checkSession = async () => {
      // await verifySession(navigate);
    };
    checkSession();

    fetchBooks();
  }, [navigate]);

  const manageBook = async () => {
    if (username === "" || book === undefined || book === "") {
      notification("top-center", "Fill form", "error", "dark");
      return;
    }
    const [author, title] = book.split("&");

    const body = {
      title: title,
      author: author,
    };

    const endpoint = action ? "/returnBook" : "/loanBook";
    const requestBody = action ? { username: username, ...body } : { user_username: username, ...body };

    await client
      .post(endpoint, requestBody)
      .then(() => notification("top-center", `Book ${action ? "returned" : "loaned"}`, "success", "dark"))
      .catch((error: AxiosError) => notification("top-center", error.message, "error", "dark"));
  };

  const filteredOptions = books.filter((book) =>
    `${book.title}&${book.author}`.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <main className="flex flex-col p-5 rounded-md bg-gray-700">
      <h1 className="text-center text-2xl font-bold">Manage</h1>
      <section className="flex justify-center mt-5">
        <label className="flex items-center">
          <span className="mr-2">Loan</span>
          <div className="relative">
            <input type="checkbox" checked={action} onChange={() => setAction(!action)} className="sr-only" />
            <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
            <div
              className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${
                action ? "transform translate-x-full" : ""
              }`}
            ></div>
          </div>
          <span className="ml-2">Return</span>
        </label>
      </section>
      <section>
        <span>User</span>
        <input
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md bg-gray-600"
        />
      </section>
      <section>
        <span>Book</span>
        <main className="custom-select">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md bg-gray-600"
            placeholder="Search..."
          />
          <select
            value={book}
            onChange={(e) => setBook(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md bg-gray-600"
          >
            <option disabled value="">
              Select a book
            </option>
            {filteredOptions.map((option, index) => (
              <option key={index} value={`${option.author}&${option.title}`}>
                {option.author} - {option.title}
              </option>
            ))}
          </select>
        </main>
      </section>
      <button onClick={manageBook} className="p-2 mt-2 bg-gray-600 text-white rounded-md">
        Lend
      </button>
    </main>
  );
};

export default Manage;
