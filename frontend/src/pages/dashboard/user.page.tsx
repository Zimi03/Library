import { FormEvent, useEffect, useState } from "react";
//import verifySession from "../../utils/verifySession";
import notification from "../../utils/notify";
import client from "../../utils/axiosClient";
import ISearchBooksParams from "../../interfaces/ISearchBooksParams";
import { Book } from "../librarian/components/book/books";
import { AxiosError, AxiosResponse } from "axios";
import Navbar from "../../components/navbar";
import IUser from "../../interfaces/IUser";

async function findBookReq(filters: ISearchBooksParams) {
  const params = {
    title: filters?.title || "",
    author: filters?.author || "",
    genre: filters?.genre || "",
  };

  const res = (await client
    .get(`/books`, { params: params })
    .catch((error: AxiosError) => console.log(error.message))) as AxiosResponse;

  return res;
}

function UserPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchItem, setSearchItem] = useState<ISearchBooksParams>({
    title: "",
    author: "",
    genre: "",
  });
  const [user, SetUser] = useState<IUser>();
  const [reservations, setReservations] = useState<Book[]>([
    //{ author: "xd", genre: "xd2", id: 1, status: "dostępna", title: "xd3" },
  ]);

  const getUser = async () => {
    const response = (await client
      .get("/user")
      .catch((error: AxiosError) => console.log(error.message))) as AxiosResponse;

    SetUser(response.data);
  };

  const getAllReservations = async () => {
    console.log(user?.username);
    const response = (await client
      .get("/userReservations", { params: { username: user?.username } })
      .catch((error: AxiosError) => console.log(error.message))) as AxiosResponse;

    console.log(response.data.params);

    setReservations(response.data);
  };

  const reserveBook = async (books: Array<string>) => {
    console.log(user?.username);
    const data = { username: user?.username || "notfound", books: books };
    const response = (await client
      .post("/reserveBook", data)
      .catch((error: AxiosError) => console.log(error.message))) as AxiosResponse;

    console.log(response.data.params);

    setReservations(response.data);

    return response;
  };
  useEffect(() => {
    const fetchData = async () => {
      await getUser();
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (user) {
      getAllReservations();
    }
  }, [user]);

  const OnChangeHandler = (event: FormEvent) => {
    const target = event.target as HTMLInputElement;
    const { name, value } = target;
    setSearchItem((prevSearchData) => ({
      ...prevSearchData,
      [name]: value,
    }));
  };

  return (
    <div className="h-screen w-screen">
      <Navbar />
      <div className="bg-gray-800 w-96 h-80 p-8 absolute top-1/3 left-1/4 transform -translate-x-1/2 -translate-y-1/2 rounded-lg transition-transform">
        <h1 className="text-center text-2xl font-bold top-0">Search books</h1>
        <form className="flex gap-4 flex-col h-full w-full p-6" onChange={OnChangeHandler}>
          <input type="search" className="text-center w-full h-1/3 rounded-lg" placeholder="title" name="title" />
          <input type="search" className="text-center w-full h-1/3 rounded-lg" placeholder="author" name="author" />
          <input type="search" className="text-center w-full h-1/3 rounded-lg" placeholder="genre" name="genre" />
          <button
            onClick={async (event) => {
              event.preventDefault();
              const { data } = await findBookReq(searchItem);
              setBooks(data as unknown as Book[]);
              notification("top-center", "found!", "success", "dark");
            }}
            className="h-14 w-full p-4 items-center justify-center border-white border rounded-lg"
            type="submit"
          >
            Search
          </button>
        </form>
      </div>
      <div className="h-1/2 w-full bottom-0 fixed p-8">
        <ul className="h-full overflow-auto">
          {books.map((book, index) => (
            <li key={index} className="mb-2 p-2 border-b border-gray-800 rounded-md flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold">Title: {book.title}</h2>
                <p>Author: {book.author}</p>
                <p>Genre: {book.genre}</p>
              </div>
              <button
                type="submit"
                className={`right-0 text-white float-right text-lg font-bold ml-auto h-full w-44 p-2 rounded-md hover:bg-gray-500`}
                onClick={async () =>
                  await reserveBook([book.title])
                    .then((_res: AxiosResponse) => notification("top-center", _res.data.message, "success", "dark"))
                    .catch((error: AxiosError) => notification("top-center", error.message, "error", "dark"))
                }
              >
                Reserve
              </button>
              <p className={`text-lg font-bold ${book.status !== "niedostępna" ? "text-green-500" : "text-red-500"}`}>
                {book.status}
              </p>
            </li>
          ))}
          {books.length === 0 && <p className="text-center text-lg font-bold">No books found</p>}
        </ul>
      </div>
      <div className="bg-gray-800 w-96 h-80 p-8 absolute top-1/3 left-3/4 transform -translate-x-1/2 -translate-y-1/2 rounded-lg transition-transform">
        <h1 className="text-center text-2xl font-bold top-0">My Reservations</h1>
        <ul className="h-full w-full overflow-x-hidden overflow-y-visible p-8">
          {reservations.map((reservation, index) => (
            <li key={index} className="h-6 w-full text-center items-center bg-gray-500 rounded-md">
              {reservation.author}: {reservation.title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default UserPage;
