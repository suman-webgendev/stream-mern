import { getCookie } from "@/lib/utils";
import Home from "@/pages/Home";
import Layout from "@/pages/Layout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import VideoPage from "@/pages/VideoPage";
import { jwtDecode } from "jwt-decode";
import { Route, Routes } from "react-router-dom";

const App = () => {
  const token = getCookie();
  if (token) {
    const decoded = jwtDecode(token);
    console.log(decoded);
  }

  return (
    <div>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/:id" element={<VideoPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
