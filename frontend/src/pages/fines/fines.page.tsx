import Navbar from "../../components/navbar.tsx";
import client from "../../utils/axiosClient.ts";
import {useState} from "react";

const fetchUserFines = async (username: string) => {
    const response = await client.get(`/getFines?username=${username}`);
    return response.data;
}

type Fine = { "fine_id": number, "amount": number, " paid ": boolean }


const FinesPage = () => {

    const [fines, setFines] = useState<Fine[]>([]);

    const [username, setUsername] = useState<string>("");

    const [searched, setSearched] = useState<boolean>(false);

    const getUserFines = async () => {
        const response = await fetchUserFines(username);
        setFines(response);
        setSearched(true);
    };

    const displayTotalFines = () => {
        return fines.reduce((total, fine) => total + fine.amount, 0);
    }

    const payFines = async () => {
        client.post(`/payFine`, {
            username,
        }).then(() => {
            setSearched(false);
            location.reload();
        });
    };

    const payFineModule = () => (
        <section className="flex flex-col gap-2">
                       <span>
                            You have to pay <span className="text-red-500">{displayTotalFines()}</span> in fines
                        </span>
            <button onClick={payFines} className="rounded-md bg-gray-500 p-2">Pay</button>
        </section>
    )

    const noFinesModule = () => (
        <section className="flex flex-col gap-2">
            <span>
                You have no fines
            </span>
        </section>
    )

    return (
        <main className=" h-screen w-screen">
            <Navbar/>
            <div className='flex justify-center items-center w-full h-full'>
                <section
                    className="flex flex-col justify-center content-center bg-gray-700 rounded-md gap-5 p-10 items-center w-1/4 h-1/4">
                    <h1 className="font-bold text-2xl">Fines</h1>
                    <input onChange={(e) => setUsername(e.target.value)} placeholder="Username"
                           className="font-medium rounded-md bg-gray-500 p-2"/>
                    <button onClick={getUserFines} className="rounded-md bg-gray-500 p-2">Search</button>
                    {searched && <div>
                        {
                            fines.length > 0 ? payFineModule() : noFinesModule()
                        }
                    </div>
                    }
                </section>
            </div>
        </main>
    );
};

export default FinesPage;