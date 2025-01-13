import client from "../utils/axiosClient";
import { useNavigate } from "react-router-dom";
import notification from "../utils/notify";
import { AxiosError, AxiosResponse } from "axios";

const Navbar = () => {
  const navigate = useNavigate();

  const logout = async () => {
    await client
      .post("/logout")
      .then((res: AxiosResponse) => notification("top-center", res.data.message, "success", "dark"))
      .catch((error: AxiosError) => notification("top-center", error.message, "error", "dark"));
    navigate("/login");
  };

  return (
      <nav className="w-full h-32 top-0 absolute bg-transparent pointer-events-none">
          <button onClick={() => navigate("/librarian")}
                  className="w-32 h-28 p-4 hover:text-pink-500 pointer-events-auto">
              Librarian
          </button>
          <button onClick={() => navigate("/admin")} className="w-32 h-28 p-4 hover:text-pink-500 pointer-events-auto">
              Admin
          </button>
          <button onClick={() => navigate("/dashboard")}
                  className="w-32 h-28 p-4 hover:text-pink-500 pointer-events-auto">
              User
          </button>
          <button onClick={() => navigate("/fines")}
                  className="w-32 h-28 p-4 hover:text-pink-500 pointer-events-auto">
              Fines
          </button>
          <button onClick={logout} className="w-32 h-28 p-4 hover:text-pink-700 pointer-events-auto">
              Logout
          </button>
      </nav>
  );
};

export default Navbar;
