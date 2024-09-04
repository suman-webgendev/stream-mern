import ChatBox from "@/components/chat/ChatBox";
import MyChats from "@/components/chat/MyChats";
import SideDrawer from "@/components/chat/SideDrawer";
import { useAuth } from "@/hooks/useAuth";
import { Box } from "@chakra-ui/react";

const Chat = () => {
  const { user } = useAuth();

  return (
    <div className="w-full">
      {user && <SideDrawer />}
      <Box
        display="flex"
        justifyContent="space-between"
        w="100%"
        h="91.5vh"
        p="10px"
      >
        {user && <MyChats />}
        {user && <ChatBox />}
      </Box>
    </div>
  );
};

export default Chat;
