import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { getSender } from "@/lib/utils";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { Box, IconButton, Text } from "@chakra-ui/react";
import UpdateGroupModal from "../modals/UpdateGroupModal";

const SingleChat = () => {
  const { selectedChat, setSelectedChat } = useChat();
  const { user } = useAuth();
  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={2}
            px={2}
            w="100%"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />

            {!selectedChat.isGroupChat ? (
              <>{getSender(user, selectedChat.users)}</>
            ) : (
              <>
                {selectedChat.chatName}
                <UpdateGroupModal />
              </>
            )}
          </Text>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#e8e8e8"
            w="100%"
            h="86.5%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {/* messages */}
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <Text fontSize="3xl" pb={3}>
            Click on a user or group to start chatting.
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
