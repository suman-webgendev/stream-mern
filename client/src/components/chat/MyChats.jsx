import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import GroupChatModal from "@/components/modals/GroupChatModal";
import { useAuth } from "@/hooks/auth";
import { useAllChats, useChat } from "@/hooks/chats";
import { cn, getSender } from "@/lib/utils";
import ChatLoading from "./ChatLoading";

const MyChats = () => {
  const { selectedChat, setSelectedChat, setChats, chats } = useChat();
  const { user } = useAuth();
  const { error } = useAllChats(setChats);

  if (error) {
    toast.error("Error occurred!", {
      description: "Failed to fetch chats!",
      duration: 3000,
      position: "bottom-left",
      dismissible: true,
    });
  }
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center rounded-lg border bg-white p-1 md:flex md:w-1/4",
        selectedChat && "hidden",
      )}
    >
      <div className="flex w-full flex-row items-center justify-between p-1 text-2xl md:flex-col md:text-2xl lg:flex-col xl:flex-row">
        My Chats
        <GroupChatModal>
          <Button className="flex items-center gap-1">
            <span>
              <Plus className="size-5 font-semibold" />
            </span>
            New Group Chat
          </Button>
        </GroupChatModal>
      </div>
      <div className="flex size-full flex-col overflow-hidden rounded-lg bg-[#f8f8f8] p-1">
        {Array.isArray(chats) && chats.length > 0 ? (
          <div className="overflow-y-scroll">
            {chats?.map((chat) => (
              <div
                key={chat._id}
                onClick={() => setSelectedChat(chat)}
                className={cn(
                  "mb-2 cursor-pointer rounded-lg bg-[#e8e8e8] px-3 py-2 text-black",
                  selectedChat === chat && "bg-[#38B2AC] text-white",
                )}
              >
                <p className="ml-0.5 p-0.5 font-extrabold">
                  {!chat.isGroupChat
                    ? getSender(user, chat.users)
                    : chat.chatName}
                </p>
                {chat?.lastMessage ? (
                  <div className="flex items-center space-x-2">
                    <Avatar>
                      <AvatarImage src="/user.jpg" alt="user" />
                      <AvatarFallback className="text-black">
                        {chat.lastMessage.sender?.name.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <p>
                      <span>
                        {chat.lastMessage.sender?.name === user.name
                          ? "Me"
                          : chat.lastMessage.sender?.name}
                        :
                      </span>
                      {chat?.lastMessage?.content.includes("data:image/")
                        ? "Photo"
                        : chat?.lastMessage?.content.slice(0, 6) +
                          (chat?.lastMessage?.content.length > 6 ? "..." : "")}
                    </p>
                  </div>
                ) : (
                  <p>No messages yet.</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <ChatLoading />
        )}
      </div>
    </div>
  );
};

export default MyChats;
