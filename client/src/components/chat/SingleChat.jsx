// //! With optimistic update
// import { useAuth } from "@/hooks/useAuth";
// import { useChat } from "@/hooks/useChat";
// import { api, getSender } from "@/lib/utils";
// import { ArrowBackIcon } from "@chakra-ui/icons";
// import {
//   Box,
//   FormControl,
//   IconButton,
//   Input,
//   Spinner,
//   Text,
//   useToast,
// } from "@chakra-ui/react";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { useCallback, useEffect, useRef, useState } from "react";
// import { io } from "socket.io-client";
// import UpdateGroupModal from "../modals/UpdateGroupModal";
// import EmojiPicker from "./EmojiPicker";
// import MyMessage from "./MyMessage";
// import YourMessage from "./YourMessage";

// let socket;
// let selectedChatCompare;

// const SingleChat = () => {
//   const { selectedChat, setSelectedChat } = useChat();
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSocketConnected, setIsSocketConnected] = useState(false);
//   const { user } = useAuth();
//   const toast = useToast();
//   const queryClient = useQueryClient();
//   const inputRef = useRef(null);
//   const messagesEndRef = useRef(null);

//   const { mutate: send } = useMutation({
//     mutationFn: async (messageContent) => {
//       const { data } = await api.post("api/chat/message", {
//         content: messageContent,
//         chatId: selectedChat._id,
//       });
//       return data;
//     },
//     onMutate: async (newMessageContent) => {
//       await queryClient.cancelQueries({
//         queryKey: ["GetMessages", selectedChat._id],
//       });

//       const previousMessages = queryClient.getQueryData([
//         "GetMessages",
//         selectedChat._id,
//       ]);

//       const optimisticMessage = {
//         _id: Date.now().toString(),
//         content: newMessageContent,
//         sender: { _id: user._id, name: user.name },
//         createdAt: new Date().toISOString(),
//       };

//       queryClient.setQueryData(["GetMessages", selectedChat._id], (old) => {
//         return Array.isArray(old)
//           ? [...old, optimisticMessage]
//           : [optimisticMessage];
//       });

//       setMessages((prev) => [...prev, optimisticMessage]);
//       socket.emit("new message", previousMessages);

//       return { previousMessages };
//     },
//     onError: (err, newMessage, context) => {
//       queryClient.setQueryData(
//         ["GetMessages", selectedChat._id],
//         context.previousMessages,
//       );
//       setMessages(context.previousMessages);
//       toast({
//         title: "Failed to send message",
//         description: err.message,
//         status: "error",
//         duration: 3000,
//         isClosable: true,
//       });
//     },
//     onSettled: () => {
//       queryClient.invalidateQueries({
//         queryKey: ["GetMessages", selectedChat._id],
//       });
//       selectedChatCompare = selectedChat;
//     },
//   });

//   const sendMessage = (event) => {
//     if (event.key === "Enter") {
//       if (event.ctrlKey) {
//         return;
//       }
//       if (
//         !event.altKey &&
//         !event.shiftKey &&
//         !event.metaKey &&
//         newMessage.trim()
//       ) {
//         event.preventDefault();
//         send(newMessage.trim());
//         setNewMessage("");
//       }
//     }
//   };

//   const typingHandler = (e) => {
//     setNewMessage(e.target.value);
//   };

//   useQuery({
//     queryKey: ["GetMessages", selectedChat?._id],
//     queryFn: async () => {
//       if (!selectedChat) return [];
//       setIsLoading(true);
//       try {
//         const { data } = await api.get(`/api/chat/message/${selectedChat._id}`);
//         if (Array.isArray(data)) {
//           setMessages(data);
//           socket.emit("join chat", selectedChat._id);
//         } else {
//           console.error("Received non-array data for messages:", data);
//           setMessages([]);
//         }
//         return data;
//       } finally {
//         setIsLoading(false);
//       }
//     },
//     enabled: !!selectedChat,
//   });

//   useEffect(() => {
//     if (!Array.isArray(messages)) {
//       console.error("Messages is not an array:", messages);
//       setMessages([]);
//     }
//   }, [messages]);

//   useEffect(() => {
//     setIsLoading(true);
//   }, [selectedChat]);

//   const scrollToBottom = () => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const handleEmojiSelect = useCallback((emoji) => {
//     if (inputRef.current) {
//       const input = inputRef.current;
//       const start = input.selectionStart;
//       const end = input.selectionEnd;
//       const text = input.value;
//       input.setSelectionRange(start + emoji.length, start + emoji.length);
//       setNewMessage(text.substring(0, start) + emoji + text.substring(end));
//     }
//   }, []);

//   useEffect(() => {
//     socket = io("http://localhost:8080");
//     socket.emit("setup", user);
//     socket.on("connection", () => setIsSocketConnected(true));

//     return () => {
//       socket.disconnect();
//     };
//   }, [user]);

//   useEffect(() => {
//     socket.on("message received", (newMessageReceived) => {
//       if (
//         !selectedChatCompare ||
//         selectedChatCompare._id !== newMessageReceived.chat._id
//       ) {
//         // send Notification
//       } else {
//         setMessages(...messages, newMessageReceived);
//       }
//     });
//   }, [messages]);

//   return (
//     <>
//       {selectedChat ? (
//         <>
//           <Text
//             fontSize={{ base: "28px", md: "30px" }}
//             pb={2}
//             px={2}
//             w="100%"
//             display="flex"
//             justifyContent={{ base: "space-between" }}
//             alignItems="center"
//           >
//             <IconButton
//               display={{ base: "flex", md: "none" }}
//               icon={<ArrowBackIcon />}
//               onClick={() => setSelectedChat("")}
//             />
//             {!selectedChat.isGroupChat ? (
//               <>{getSender(user, selectedChat.users)}</>
//             ) : (
//               <>
//                 {selectedChat.chatName}
//                 <UpdateGroupModal />
//               </>
//             )}
//           </Text>
//           <Box
//             display="flex"
//             flexDir="column"
//             justifyContent="flex-end"
//             p={3}
//             bg="#e8e8e8"
//             w="100%"
//             h="100%"
//             borderRadius="lg"
//             overflowY="hidden"
//           >
//             {isLoading ? (
//               <Spinner
//                 size="xl"
//                 w={20}
//                 h={20}
//                 alignSelf="center"
//                 margin="auto"
//               />
//             ) : (
//               <div
//                 className="flex scroll-m-1 flex-col overflow-y-scroll"
//                 style={{ scrollbarWidth: "none" }}
//               >
//                 {Array.isArray(messages) &&
//                   messages.map((message) => (
//                     <div key={message._id}>
//                       {message.sender._id === user._id ? (
//                         <MyMessage message={message.content} />
//                       ) : (
//                         <YourMessage message={message.content} />
//                       )}
//                     </div>
//                   ))}
//                 <div ref={messagesEndRef} />
//               </div>
//             )}
//             <FormControl onKeyDown={sendMessage} isRequired mt={3}>
//               <Input
//                 ref={inputRef}
//                 variant="filled"
//                 bg="#E0E0E0"
//                 placeholder="Enter a message..."
//                 onChange={typingHandler}
//                 value={newMessage}
//                 pl="2.2rem"
//                 autoFocus
//                 autoComplete="off"
//               />
//               <div className="absolute bottom-2 left-2">
//                 <EmojiPicker onEmojiSelect={handleEmojiSelect} />
//               </div>
//             </FormControl>
//           </Box>
//         </>
//       ) : (
//         <Box
//           display="flex"
//           alignItems="center"
//           justifyContent="center"
//           h="100%"
//         >
//           <Text fontSize="3xl" pb={3}>
//             Click on a user or group to start chatting.
//           </Text>
//         </Box>
//       )}
//     </>
//   );
// };

// export default SingleChat;

//! Working but bad code

import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { api, getSender } from "@/lib/utils";
import { ArrowBackIcon } from "@chakra-ui/icons";
import {
  Box,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import UpdateGroupModal from "../modals/UpdateGroupModal";
import EmojiPicker from "./EmojiPicker";
import MyMessage from "./MyMessage";
import TypingIndicator from "./TypingIndicator";
import YourMessage from "./YourMessage";

const ENDPOINT = "http://localhost:8080";
let selectedChatCompare;

const SingleChat = () => {
  const { selectedChat, setSelectedChat } = useChat();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const toast = useToast();
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const newSocket = io(ENDPOINT);
    setSocket(newSocket);

    newSocket.on("connect", () => setIsSocketConnected(true));

    newSocket.emit("setup", user);
    newSocket.on("typing", () => setIsTyping(true));
    newSocket.on("stopped typing", () => setIsTyping(false));
    return () => {
      newSocket.off("setup", () => {
        console.log("User disconnected");
      });
      newSocket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    socket.on("message received", (newMessageReceived) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        // Notification logic here
      } else {
        setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
      }
    });

    return () => {
      socket.off("message received");
    };
  }, [socket, selectedChat]);

  const fetchMessages = useCallback(async () => {
    if (!selectedChat) return;

    try {
      setLoading(true);
      const { data } = await api.get(`/api/chat/message/${selectedChat._id}`);
      setMessages(data);
      setLoading(false);
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Failed to Load the Messages",
        description: error.stack,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  }, [selectedChat, socket, toast]);

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
  }, [selectedChat, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stopped typing", selectedChat._id);
      try {
        const { data } = await api.post("/api/chat/message", {
          content: newMessage,
          chatId: selectedChat._id,
        });
        socket.emit("new message", data);
        setMessages([...messages, data]);
        setNewMessage("");
      } catch (error) {
        toast({
          title: "Failed to send the Message",
          description: error.stack,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!isSocketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    let lastTypingTime = new Date().getTime();
    let timerLength = 3000;
    setTimeout(() => {
      let timeNow = new Date().getTime();
      let timeDiff = timeNow - lastTypingTime;

      if (timeDiff >= timerLength && typing) {
        socket.emit("stopped typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const handleEmojiSelect = useCallback((emoji) => {
    if (inputRef.current) {
      const input = inputRef.current;
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const text = input.value;
      const newText = text.substring(0, start) + emoji + text.substring(end);
      setNewMessage(newText);
      input.setSelectionRange(start + emoji.length, start + emoji.length);
      input.focus();
    }
  }, []);

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={2}
            px={2}
            w="100%"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {!selectedChat.isGroupChat ? (
              <>{getSender(user, selectedChat.users)}</>
            ) : (
              <>
                {selectedChat.chatName}
                <UpdateGroupModal />
              </>
            )}
          </Text>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#e8e8e8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div
                className="flex scroll-m-1 flex-col overflow-y-scroll"
                style={{ scrollbarWidth: "none" }}
              >
                {Array.isArray(messages) &&
                  messages.map((message) => (
                    <div key={message._id}>
                      {message.sender._id === user._id ? (
                        <MyMessage message={message.content} />
                      ) : (
                        <YourMessage message={message.content} />
                      )}
                    </div>
                  ))}
                <div ref={messagesEndRef} />
              </div>
            )}
            <FormControl onKeyDown={sendMessage} isRequired mt={3}>
              {isTyping && <TypingIndicator />}
              <Input
                ref={inputRef}
                variant="filled"
                bg="#E0E0E0"
                placeholder="Enter a message..."
                onChange={typingHandler}
                value={newMessage}
                pl="2.2rem"
                autoFocus
                autoComplete="off"
              />
              <div className="absolute bottom-2 left-2">
                <EmojiPicker onEmojiSelect={handleEmojiSelect} />
              </div>
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <Text fontSize="3xl" pb={3}>
            Click on a user or group to start chatting.
          </Text>
        </Box>
      )}
    </>
  );
};
export default SingleChat;
