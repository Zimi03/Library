import { Link, useLocation, useNavigate } from "react-router-dom";
import Books from "./book/books.tsx";
import Manage from "./book/manage.tsx";
import verifySession from "../../../utils/verifySession.ts";
import { useEffect } from "react";
import Navbar from "../../../components/navbar.tsx";

const LINK_STYLE = "p-2 rounded-md hover:bg-gray-500";

const MANAGE_ROUTE = "#manage";
const BOOKS_ROUTE = "#";

const DashboardPage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    verifySession(navigate);
  }, [navigate]);

  const path = useLocation().hash;

  const displayComponent = () => {
    switch (path) {
      case MANAGE_ROUTE:
        return <Manage />;
      default:
        return <Books />;
    }
  };

  return (
    <main className="flex items-center justify-center h-screen w-screen p-10">
      <Navbar />
      <nav className={"absolute top-10 bg-gray-600 p-2 rounded-md flex justify-center"}>
        <ul className={"flex align-middle gap-2"}>
          <Link to={{ hash: BOOKS_ROUTE }} className={LINK_STYLE}>
            Books
          </Link>
          <Link to={{ hash: MANAGE_ROUTE }} className={LINK_STYLE}>
            Manage
          </Link>
        </ul>
      </nav>
      {displayComponent()}
    </main>
  );
};

export default DashboardPage;
