import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { api, getSender } from "@/lib/utils";
import { AddIcon } from "@chakra-ui/icons";
import { Box, Button, Stack, Text, useToast } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import GroupChatModal from "../modals/GroupChatModal";
import ChatLoading from "./ChatLoading";

const MyChats = () => {
  const { selectedChat, setSelectedChat, chats, setChats } = useChat();
  const { user } = useAuth();
  const toast = useToast();

  const { error } = useQuery({
    queryKey: ["AllChats"],
    queryFn: async () => {
      const { data } = await api.get("/api/chat");
      setChats(data);
      return data;
    },
  });

  if (error) {
    toast({
      title: "Error occurred!",
      description: "Failed to fetch chats!",
      status: "error",
      duration: 3000,
      isClosable: true,
      position: "bottom-left",
    });
  }
  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      borderRadius="lg"
      borderWidth="1px"
      w={{ base: "100%", md: "25%" }}
    >
      <Box
        px={3}
        pb={3}
        fontSize={{ base: "24px", md: "24px" }}
        display="flex"
        flexDir={{ base: "row", md: "column", lg: "column", xl: "row" }}
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        My Chats
        <GroupChatModal>
          <Button
            display="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>
      <Box
        display="flex"
        flexDir="column"
        p={3}
        bg="#F8F8F8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {chats ? (
          <Stack overflowY="scroll">
            {chats.map((chat) => (
              <Box
                key={chat._id}
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                color={selectedChat === chat ? "white" : "black"}
                px={3}
                py={2}
                borderRadius="lg"
              >
                <Text>
                  {!chat.isGroupChat
                    ? getSender(user, chat.users)
                    : chat.chatName}
                </Text>
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
