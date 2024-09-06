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
import { useQueryClient } from "@tanstack/react-query";
import { Paperclip } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import UpdateGroupModal from "../modals/UpdateGroupModal";
import EmojiPicker from "./EmojiPicker";
import MyMessage from "./MyMessage";
import TypingIndicator from "./TypingIndicator";
import YourMessage from "./YourMessage";

const ENDPOINT = import.meta.env.VITE_APT_BASE_URL;
let selectedChatCompare;

const SingleChat = () => {
  const { selectedChat, setSelectedChat, notifications, setNotifications } =
    useChat();
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
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const newSocket = io(ENDPOINT);
    setSocket(newSocket);

    newSocket?.on("connected", () => setIsSocketConnected(true));

    newSocket?.emit("setup", user);
    newSocket?.on("typing", () => setIsTyping(true));
    newSocket?.on("stopped typing", () => setIsTyping(false));
    return () => {
      newSocket?.off("setup", () => {});
      newSocket?.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    socket.on("message received", (newMessageReceived) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        if (!notifications.includes(newMessageReceived)) {
          setNotifications([newMessageReceived, ...notifications]);
          queryClient.invalidateQueries({ queryKey: ["AllChats"] });
        }
      } else {
        setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
      }
    });

    return () => {
      socket?.off("message received");
    };
  }, [socket, selectedChat, notifications, setNotifications, queryClient]);

  const fetchMessages = useCallback(async () => {
    if (!selectedChat) return;

    try {
      setLoading(true);
      const { data } = await api.get(`/api/chat/message/${selectedChat._id}`);
      setMessages(data);
      setLoading(false);
      socket?.emit("join chat", selectedChat._id);
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

  const handleImageUpload = useCallback(
    async (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64String = reader.result.split(",")[1];

          socket.emit("image upload", {
            imageData: base64String,
            filename: file.name,
            userId: user._id,
            chatId: selectedChat._id,
          });
        };
        reader.readAsDataURL(file);
      }
    },
    [selectedChat, socket, user],
  );

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
  }, [selectedChat, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  const sendMessage = useCallback(
    async (event) => {
      if (event.key === "Enter" && newMessage) {
        socket.emit("stopped typing", selectedChat._id);
        try {
          const { data } = await api.post("/api/chat/message", {
            content: newMessage,
            chatId: selectedChat._id,
            type: "text",
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
    },
    [messages, newMessage, selectedChat, socket, toast],
  );

  const typingHandler = useCallback(
    (e) => {
      setNewMessage(e.target.value);

      if (!isSocketConnected) return;

      if (!typing) {
        setTyping(true);
        socket?.emit("typing", selectedChat._id);
      }

      let lastTypingTime = new Date().getTime();
      let timerLength = 3000;
      setTimeout(() => {
        let timeNow = new Date().getTime();
        let timeDiff = timeNow - lastTypingTime;

        if (timeDiff >= timerLength && typing) {
          socket?.emit("stopped typing", selectedChat._id);
          setTyping(false);
        }
      }, timerLength);
    },
    [isSocketConnected, selectedChat, socket, typing],
  );

  const handleEmojiSelect = useCallback((emoji) => {
    if (inputRef.current) {
      const input = inputRef.current;
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const text = input.value;
      const newText = text.substring(0, start) + emoji + text.substring(end);
      setNewMessage(newText);
      input.setSelectionRange(start + emoji.length, start + emoji.length);
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
                        <MyMessage
                          message={message.content}
                          type={message.type || "text"}
                        />
                      ) : (
                        <YourMessage
                          message={message.content}
                          type={message.type || "text"}
                        />
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
                pr="2.2rem"
                autoFocus
                autoComplete="off"
              />
              <div className="absolute bottom-2 left-2">
                <EmojiPicker onEmojiSelect={handleEmojiSelect} />
              </div>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                display="none"
                ref={fileInputRef}
              />
              <Paperclip
                onClick={() => fileInputRef?.current.click()}
                className="absolute bottom-2 right-2 z-10 cursor-pointer"
              />
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
