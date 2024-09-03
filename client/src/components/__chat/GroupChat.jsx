import { useChat } from "@/hooks/useChat";
import { Card, CardHeader } from "../ui/card";

const GroupChat = ({ chat }) => {
  const { setSelectedChat, socket } = useChat();

  const handleClick = () => {
    setSelectedChat(chat);

    if (socket) {
      socket.emit("joinRoom", chat._id);
    }
  };

  return (
    <Card className="mb-2 cursor-pointer" onClick={handleClick}>
      <CardHeader className="flex flex-row items-center gap-2 text-center">
        <svg
          id="usersIcon"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-users-round text-black dark:text-white"
        >
          <path d="M18 21a8 8 0 0 0-16 0" />
          <circle cx="10" cy="8" r="5" />
          <path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3" />
        </svg>
        <p>{chat.chatName}</p>
      </CardHeader>
    </Card>
  );
};

export default GroupChat;
