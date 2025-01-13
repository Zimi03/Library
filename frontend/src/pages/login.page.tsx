import { FormEvent, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AxiosError, AxiosResponse } from "axios";
import client from "../utils/axiosClient";
import IUserLoginParams from "../interfaces/IUserLoginParams";
import notification from "../utils/notify";

async function loginReq(data: IUserLoginParams): Promise<AxiosResponse> {
  return await client.post("/login", data);
}

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<IUserLoginParams>({
    username: "",
    password: "",
  });
  useEffect(() => {
    console.log(formData);
  }, [formData]);

  const OnChangeHandler = (event: FormEvent) => {
    const target = event.target as HTMLInputElement;
    const { name, value } = target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };
  return (
    <div className="h-screen w-screen">
      <div className="bg-gray-800 w-80 h-96 p-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-lg transition-transform">
        <h1 className="text-center text-2xl font-bold top-0">Login</h1>
        <form className="flex gap-4 flex-col h-2/3 w-full p-6" onChange={OnChangeHandler}>
          <input
            type="text"
            className="w-full h-1/2 text-center bg-gray-800 border-solid outline-none border-b border-transparent focus:border-gray-300 ease-in duration-100"
            placeholder="username"
            name="username"
          />
          <input
            type="password"
            className="w-full h-1/2 text-center bg-gray-800 border-solid outline-none border-b border-transparent focus:border-gray-300 ease-in duration-100"
            placeholder="password"
            name="password"
          />
        </form>
        <button
          onClick={async () =>
            loginReq(formData)
              .then((response: AxiosResponse) => {
                notification("top-center", response.data.message, "success", "dark");
                navigate("/dashboard");
              })
              .catch((error: AxiosError) => notification("top-center", error.message, "error", "dark"))
          }
          className="h-14 w-full p-4 items-center justify-center border-white border rounded-lg"
          type="submit"
        >
          Submit
        </button>
        <p>
          <Link className="underline text-blue-600" to="/register">
            Don't have account?
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
