import { lazy, Suspense } from "react";

import { useChat } from "@/hooks/useChat";
import { Box } from "@chakra-ui/react";
import ChatLoading from "./ChatLoading";

const ChatBox = () => {
  const { selectedChat } = useChat();
  const SingleChat = () => lazy(() => import("./SingleChat"));
  return (
    <Box
      display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      alignItems="center"
      flexDir="column"
      p={3}
      bg="white"
      w={{ base: "100%", md: "74.5%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <Suspense fallback={<ChatLoading />}>
        <SingleChat />
      </Suspense>
    </Box>
  );
};

export default ChatBox;
