import { useChat } from "@/hooks/chats";
import { cn } from "@/lib/utils";
import SingleChat from "./SingleChat";

const ChatBox = () => {
  const { selectedChat } = useChat();

  return (
    <div
      className={cn(
        "hidden w-full flex-col items-center rounded-lg border bg-white p-1 md:flex md:w-[74.5%]",
        selectedChat && "flex",
      )}
    >
      <SingleChat />
    </div>
  );
};

export default ChatBox;
