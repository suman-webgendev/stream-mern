// import { useChat } from "@/hooks/useChat";
// import { Card, CardHeader } from "../ui/card";

// const OneToOneChat = ({ chat, currentUser }) => {
//   const { setSelectedChat, socket } = useChat();

//   // Find the other user in the chat
//   const otherUser = chat.users.find((user) => user._id !== currentUser._id);

//   const handleClick = () => {
//     const roomName = otherUser._id; // Use the other user's ID as the room name

//     setSelectedChat(chat);

//     // Emit an event to join the room
//     if (socket) {
//       socket.emit("joinRoom", roomName);
//     }
//   };

//   return (
//     <Card className="mb-2 cursor-pointer" onClick={handleClick}>
//       <CardHeader className="flex flex-row items-center gap-2 text-center">
//         <svg
//           id="userIcon"
//           xmlns="http://www.w3.org/2000/svg"
//           width="24"
//           height="24"
//           viewBox="0 0 24 24"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth="2"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           className="lucide lucide-users-round text-black dark:text-white"
//         >
//           <circle cx="12" cy="8" r="5" />
//           <path d="M20 21a8 8 0 0 0-16 0" />
//         </svg>
//         <p>{otherUser?.name}</p>
//       </CardHeader>
//     </Card>
//   );
// };

// export default OneToOneChat;

import { useChat } from "@/hooks/useChat";
import { Card, CardHeader } from "../ui/card";

const OneToOneChat = ({ chat, currentUser, onClick }) => {
  const { setSelectedChat, socket } = useChat();

  // Find the other user in the chat
  const otherUser = chat.users.find((user) => user?._id !== currentUser?._id);

  const handleClick = () => {
    setSelectedChat(chat);
    if (socket) {
      const roomName = otherUser?._id; // Use the other user's ID as the room name
      socket.emit("joinChat", roomName);
    }
    if (onClick) {
      onClick(); // Execute additional logic passed from ChatSidebar
    }
  };

  return (
    <Card className="mb-2 cursor-pointer" onClick={handleClick}>
      <CardHeader className="flex flex-row items-center gap-2 text-center">
        <svg
          id="userIcon"
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
          <circle cx="12" cy="8" r="5" />
          <path d="M20 21a8 8 0 0 0-16 0" />
        </svg>
        <p>{otherUser?.name}</p>
      </CardHeader>
    </Card>
  );
};

export default OneToOneChat;
