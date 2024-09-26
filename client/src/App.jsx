import PrivateRoute from "@/components/auth/PrivateRoute";
import Chat from "@/pages/Chat";
import Checkout from "@/pages/Checkout";
import Home from "@/pages/Home";
import Layout from "@/pages/Layout";
import Login from "@/pages/Login";
import PricingPage from "@/pages/PricingPage";
import Register from "@/pages/Register";
import VideoPage from "@/pages/VideoPage";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";

const CheckoutRoute = ({ element }) => {
  const navigate = useNavigate();

  const location = useLocation();
  const { priceId } = location.state || {};

  useEffect(() => {
    if (!priceId) {
      navigate("/");
    }
  }, [priceId, navigate]);

  return priceId ? element : null;
};

const pageVariants = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50 },
};

const App = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route
          path="/register"
          element={
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
            >
              <Register />
            </motion.div>
          }
        />
        <Route
          path="/login"
          element={
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
            >
              <Login />
            </motion.div>
          }
        />

        {/* Private Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/video-details" element={<VideoPage />} />
            <Route path="/chats" element={<Chat />} />
            <Route
              path="/pricing"
              element={
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                >
                  <PricingPage />
                </motion.div>
              }
            />
            <Route
              path="/checkout"
              element={<CheckoutRoute element={<Checkout />} />}
            />
          </Route>
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

export default App;
