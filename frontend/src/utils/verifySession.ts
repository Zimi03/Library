import client from "./axiosClient";
import { NavigateFunction } from "react-router-dom";

async function verifySession(navigate: NavigateFunction): Promise<void> {
  await client
    .post("/check-session")
    .then(() => console.log("xd"))
    .catch(() => navigate("/login"));
}

export default verifySession;
