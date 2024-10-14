import Loading from "@/components/Loading";
import { useAuth } from "@/hooks/auth";
import { Box } from "@chakra-ui/react";
import { lazy, Suspense } from "react";

const Chat = () => {
  const { user } = useAuth();
  const SideDrawer = lazy(() => import("@/components/chat/SideDrawer"));
  const MyChats = lazy(() => import("@/components/chat/MyChats"));
  const ChatBox = lazy(() => import("@/components/chat/ChatBox"));

  return (
    <div className="w-full">
      <Suspense fallback={<Loading />}>{user && <SideDrawer />}</Suspense>
      <Box
        display="flex"
        justifyContent="space-between"
        w="100%"
        h="91.5vh"
        p="10px"
      >
        <Suspense fallback={<Loading />}>{user && <MyChats />}</Suspense>
        <Suspense fallback={<Loading />}>{user && <ChatBox />}</Suspense>
      </Box>
    </div>
  );
};

export default Chat;
