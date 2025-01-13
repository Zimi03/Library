import { useEffect, useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import IUser from "../interfaces/IUser";
import { AxiosError, AxiosResponse } from "axios";
import notification from "../utils/notify";
import client from "../utils/axiosClient";

async function registerReq(data: IUser): Promise<AxiosResponse> {
  return await client.post("http://localhost:8080/addUser", data);
}

function RegPage() {
  const [formData, setFormData] = useState<IUser>({
    username: "",
    email: "",
    phone_number: "",
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
        <h1 className="text-center text-2xl font-bold top-0">Register</h1>
        <form className="flex gap-4 flex-col h-2/3 w-full p-6" onChange={OnChangeHandler}>
          <input
            type="text"
            className="w-full h-1/5 text-center bg-gray-800 border-solid outline-none border-b border-transparent focus:border-gray-300 ease-in duration-100"
            placeholder="username"
            name="username"
          />
          <input
            type="number"
            className="w-full h-1/5 text-center bg-gray-800 border-solid outline-none border-b border-transparent focus:border-gray-300 ease-in duration-100"
            placeholder="phone number"
            name="phone_number"
          />
          <input
            type="email"
            className="w-full h-1/5 text-center bg-gray-800 border-solid outline-none border-b border-transparent focus:border-gray-300 ease-in duration-100"
            placeholder="email"
            name="email"
          />
          <input
            type="password"
            className="w-full h-1/5 text-center bg-gray-800 border-solid outline-none border-b border-transparent focus:border-gray-300 ease-in duration-100"
            placeholder="password"
            name="password"
          />
        </form>
        <button
          onClick={async () =>
            registerReq(formData)
              .then((response: AxiosResponse) => notification("top-center", response.data.message, "success", "dark"))
              .catch((error: AxiosError) => notification("top-center", error.message, "error", "dark"))
          }
          className="h-14 w-full p-4 items-center justify-center border-white border rounded-lg"
          type="submit"
        >
          Submit
        </button>
        <p>
          <Link className="underline text-blue-600" to="/login">
            have account?
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegPage;
