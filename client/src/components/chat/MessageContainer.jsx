import LoadingChats from "@/components/chat/LoadingChats";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

const MessageContainer = () => {
  const { data, isPending, error } = useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const res = await api.get("/api/chat");
      return res.data;
    },
  });

  if (!error && isPending) return <LoadingChats />;

  return (
    <div className="h-[85vh]">
      <ScrollArea className="size-full p-2">{JSON.stringify(data)}</ScrollArea>
    </div>
  );
};

export default MessageContainer;
