import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import GroupChat from "./GroupChat";
import LoadingChats from "./LoadingChats";
import OneToOneChat from "./OneToOneChat";
import SearchUser from "./SearchUser";

const ChatSidebar = () => {
  const { user } = useAuth();

  const {
    data: chats,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["AllChats"],
    queryFn: async () => {
      const res = await api.get("/api/chat");
      return res.data;
    },
  });

  return (
    <aside className="w-80 max-w-[600px] border-r-2 pr-1">
      <div className="mb-1 flex items-center justify-between gap-1">
        <SearchUser />
        <Button>Create Group</Button>
      </div>
      <ScrollArea className="h-[94vh] pb-14">
        {!error && isFetching && <LoadingChats />}
        {!isFetching && error && <div>Something went wrong!</div>}
        {chats?.map((chat) =>
          chat.isGroupChat ? (
            <GroupChat key={chat._id} chat={chat} />
          ) : (
            <OneToOneChat key={chat._id} chat={chat} currentUser={user} />
          ),
        )}
      </ScrollArea>
    </aside>
  );
};

export default ChatSidebar;
