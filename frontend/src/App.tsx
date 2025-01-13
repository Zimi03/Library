import { BrowserRouter, Route, Routes } from "react-router-dom";

import RegPage from "./pages/register.page";
import LoginPage from "./pages/login.page";
import LibrarianDashboardPage from "./pages/librarian/components/dashboard.page";
import { ToastContainer } from "react-toastify";
import UserPage from "./pages/dashboard/user.page";
import FinesPage from "./pages/fines/fines.page.tsx";

function App() {
  return (
    <>
      <ToastContainer />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegPage />} />
          <Route path="/dashboard" element={<UserPage />} />
            <Route path={"/fines"} element={<FinesPage />} />
          <Route path={"/librarian/*"} element={<LibrarianDashboardPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
