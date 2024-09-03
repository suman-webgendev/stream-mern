import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { api } from "@/lib/utils";
import { useToast } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";

const MyChats = () => {
  const [loggedUser, setLoggedUser] = useState();
  const { selectedChat, setSelectedChat, chats, setChats } = useChat();
  const { user } = useAuth();
  const toast = useToast();

  const {
    data: allChats,
    isPending,
    error,
  } = useQuery({
    queryKey: ["AllChats"],
    queryFn: async () => {
      const { data } = await api.get("/api/chat");
      return data;
    },
  });
  return <div>MyChats</div>;
};

export default MyChats;
