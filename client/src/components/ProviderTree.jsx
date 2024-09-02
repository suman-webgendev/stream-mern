import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter } from "react-router-dom";
import { ChatProvider } from "./providers/ChatProvider";

const queryClient = new QueryClient();

const ProviderTree = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <ChatProvider>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
              {children}
            </ThemeProvider>
          </ChatProvider>
        </BrowserRouter>
        <ReactQueryDevtools />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default ProviderTree;
