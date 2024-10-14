import { AuthProvider } from "@/components/providers/AuthProvider";
import { ChatProvider } from "@/components/providers/ChatProvider";
import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

const queryClient = new QueryClient();

const ProviderTree = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider>
        <AuthProvider>
          <BrowserRouter>
            <ChatProvider>{children}</ChatProvider>
          </BrowserRouter>
        </AuthProvider>
      </ChakraProvider>
    </QueryClientProvider>
  );
};

export default ProviderTree;
