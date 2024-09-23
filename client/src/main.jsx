import App from "@/App.jsx";
import ErrorBoundary from "@/components/ErrorBoundary.jsx";
import ErrorPage from "@/components/ErrorPage";
import ProviderTree from "@/components/ProviderTree";
import "@/styles/globals.css";
import "@/styles/videoPlayer.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary fallback={<ErrorPage />}>
      <ProviderTree>
        <App />
      </ProviderTree>
    </ErrorBoundary>
  </StrictMode>,
);
