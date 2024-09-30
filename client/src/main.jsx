import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "@/App.jsx";
import ErrorBoundary from "@/components/ErrorBoundary.jsx";
import ErrorPage from "@/components/ErrorPage";
import ProviderTree from "@/components/ProviderTree";
import { Toaster } from "@/components/ui/sonner";
import "@/styles/globals.css";
import "@/styles/videoPlayer.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary fallback={<ErrorPage />}>
      <ProviderTree>
        <App />
        <Toaster richColors />
      </ProviderTree>
    </ErrorBoundary>
  </StrictMode>,
);
