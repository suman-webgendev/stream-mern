// import { useAuth } from "@/hooks/useAuth";
// import { useChat } from "@/hooks/useChat";
// import { api } from "@/lib/utils";
// import { useQuery } from "@tanstack/react-query";
// import { useEffect } from "react";
// import { io } from "socket.io-client";
// import { Button } from "../ui/button";
// import { ScrollArea } from "../ui/scroll-area";
// import GroupChat from "./GroupChat";
// import LoadingChats from "./LoadingChats";
// import OneToOneChat from "./OneToOneChat";
// import SearchUser from "./SearchUser";

// const ChatSidebar = () => {
//   const { user } = useAuth();
//   const { setSocket, socket } = useChat();

//   useEffect(() => {
//     // Establish socket connection
//     const socket = io(import.meta.env.APT_BASE_URL, {
//       withCredentials: true,
//     });
//     setSocket(socket);
//     // Cleanup on unmount
//     return () => {
//       socket.disconnect();
//     };
//   }, [setSocket]);

//   const joinRoom = (roomId) => {
//     if (socket) {
//       socket.emit("joinRoom", roomId);
//     }
//   };

//   const {
//     data: chats,
//     isFetching,
//     error,
//   } = useQuery({
//     queryKey: ["AllChats"],
//     queryFn: async () => {
//       const res = await api.get("/api/chat");
//       return res.data;
//     },
//   });

//   return (
//     <aside className="w-80 max-w-[600px] border-r-2 pr-1">
//       <div>
//         <h2 className="px-3 py-2 text-2xl font-bold">My Chats</h2>
//       </div>
//       <div className="mb-1 flex items-center justify-between gap-1">
//         <SearchUser />
//         <Button>Create Group</Button>
//       </div>
//       <ScrollArea className="h-[94vh] pb-14">
//         {!error && isFetching && <LoadingChats />}
//         {!isFetching && error && <div>Something went wrong!</div>}
//         {chats?.map((chat) =>
//           chat.isGroupChat ? (
//             <GroupChat key={chat._id} chat={chat} />
//           ) : (
//             <OneToOneChat
//               key={chat._id}
//               chat={chat}
//               currentUser={user}
//               onClick={() =>
//                 joinRoom(chat.users.find((u) => u._id !== user._id)._id)
//               }
//             />
//           ),
//         )}
//       </ScrollArea>
//     </aside>
//   );
// };

// export default ChatSidebar;

import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { api } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import GroupChat from "./GroupChat";
import LoadingChats from "./LoadingChats";
import OneToOneChat from "./OneToOneChat";
import SearchUser from "./SearchUser";

const ChatSidebar = () => {
  const { setSocket, socket } = useChat();
  const { user } = useAuth();

  useEffect(() => {
    const socketConnection = io(import.meta.env.APT_BASE_URL, {
      withCredentials: true,
    });
    setSocket(socketConnection);

    return () => {
      socketConnection.disconnect();
    };
  }, [setSocket]);

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
      <div>
        <h2 className="px-3 py-2 text-2xl font-bold">My Chats</h2>
      </div>
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
            <OneToOneChat
              key={chat._id}
              chat={chat}
              onClick={() =>
                socket &&
                socket.emit(
                  "joinRoom",
                  chat.users.find((u) => u._id !== user._id)._id,
                )
              }
            />
          ),
        )}
      </ScrollArea>
    </aside>
  );
};

export default ChatSidebar;
