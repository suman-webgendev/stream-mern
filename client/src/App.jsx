import PrivateRoute from "@/components/auth/PrivateRoute";
import Chat from "@/pages/Chat";
import Home from "@/pages/Home";
import Layout from "@/pages/Layout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import VideoPage from "@/pages/VideoPage";
import { Route, Routes } from "react-router-dom";

const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      {/* Private Routes */}
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/video-details" element={<VideoPage />} />
          <Route path="/chats" element={<Chat />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
