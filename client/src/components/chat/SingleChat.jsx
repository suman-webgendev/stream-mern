import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowUp, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { toast } from "sonner";

import UpdateGroupModal from "@/components/modals/UpdateGroupModal";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { api, getSender } from "@/lib/utils";
import MessageBox from "./MessageBox";
import MyMessage from "./MyMessage";
import YourMessage from "./YourMessage";

let selectedChatCompare;

const SingleChat = () => {
  const { selectedChat, setSelectedChat, notifications, setNotifications } =
    useChat();
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [socketStatus, setSocketStatus] = useState("live");
  const [, setPaginationData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isPolling, setIsPolling] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_APT_BASE_URL);
    setSocket(newSocket);

    newSocket?.on("connected", () => {
      setIsSocketConnected(true);
      setIsPolling(false);
      setSocketStatus("live");
    });

    newSocket?.emit("setup", user);
    newSocket?.on("typing", () => setIsTyping(true));
    newSocket?.on("stopped typing", () => setIsTyping(false));

    newSocket?.on("disconnect", () => {
      setIsPolling(true);
      setSocketStatus("polling");
    });

    newSocket?.on("reconnect", () => {
      setIsPolling(false);
      setSocketStatus("live");
    });

    newSocket?.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setSocketStatus("polling");
      setIsPolling(true);
    });

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
      const { data } = await api.get(
        `/api/chat/message/${selectedChat._id}?page=${currentPage}`,
      );

      setMessages((prevMessages) => [...data.messages, ...prevMessages]);
      setPaginationData(data.pagination);
      setTotalPages(data.pagination.totalPages);
      setLoading(false);
      socket?.emit("join chat", selectedChat._id);
    } catch (error) {
      toast.error("Failed to Load the Messages", {
        description: error.stack,
        duration: 5000,
        position: "bottom-right",
        dismissible: true,
      });
    }
  }, [selectedChat, socket, currentPage]);

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
    async (message) => {
      socket.emit("stopped typing", selectedChat._id);
      try {
        const { data } = await api.post("/api/chat/message", {
          content: message,
          chatId: selectedChat._id,
          type: "text",
        });
        socket.emit("new message", data);
        setMessages((prevMessages) => [...prevMessages, data]);
        queryClient.invalidateQueries({ queryKey: ["AllChats"] });
      } catch (error) {
        toast.error("Failed to send the Message", {
          description: error.stack,
          duration: 5000,
          dismissible: true,
          position: "bottom-right",
        });
      }
    },
    [selectedChat, socket, queryClient],
  );

  const handleTyping = useCallback(() => {
    if (!isSocketConnected) return;

    if (!typing) {
      setTyping(true);
      socket?.emit("typing", selectedChat._id);
    }

    const lastTypingTime = new Date().getTime();
    const timerLength = 3000;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTime;

      if (timeDiff >= timerLength && typing) {
        socket?.emit("stopped typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  }, [isSocketConnected, selectedChat, socket, typing]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const pollMessages = useCallback(async () => {
    try {
      const { data } = await api.get(
        `/api/chat/message/${selectedChat._id}?page=${currentPage}`,
      );

      setMessages((prevMessages) => {
        const newMessages = data.messages.filter(
          (newMsg) => !prevMessages.some((msg) => msg._id === newMsg._id),
        );

        return [...newMessages, ...prevMessages];
      });
      setPaginationData(data.pagination);
    } catch (error) {
      console.error("Error while polling messages:", error);
    }
  }, [selectedChat, currentPage]);

  useEffect(() => {
    let pollingInterval;
    if (isPolling) {
      pollingInterval = setInterval(() => {
        pollMessages();
      }, 5000);
    }

    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [isPolling, pollMessages]);

  const isLastPage = currentPage === totalPages;
  const hasNextPage = currentPage < totalPages;

  const loadMoreMessages = () => {
    if (!isLastPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <>
      {selectedChat ? (
        <>
          <p className="flex w-full items-center justify-between px-2 pb-2 text-2xl md:text-3xl">
            <Button
              variant="ghost"
              className="flex items-center gap-1 md:hidden"
              onClick={() => setSelectedChat("")}
            >
              <ArrowLeft className="size-5 font-bold" />
            </Button>

            {!selectedChat.isGroupChat ? (
              <>{getSender(user, selectedChat.users)}</>
            ) : (
              <>
                {selectedChat.chatName}
                <UpdateGroupModal />
              </>
            )}
            <Badge
              v={socketStatus === "live" ? "green" : "orange"}
              className="ml-1 rounded-md px-2 py-0.5"
            >
              {socketStatus}
            </Badge>
          </p>
          <div className="flex size-full flex-col justify-end overflow-y-hidden rounded-lg bg-[#e8e8e8] p-3">
            {loading ? (
              <Loader2 className="m-auto size-20 animate-spin self-center" />
            ) : (
              <div
                className="flex scroll-m-1 flex-col overflow-y-scroll"
                style={{ scrollbarWidth: "none" }}
              >
                {!isLastPage && hasNextPage && (
                  <button
                    className="mx-auto flex w-fit items-center gap-x-3 rounded-lg bg-[#cacaca]/60 px-1"
                    onClick={loadMoreMessages}
                  >
                    Load more messages
                    <span>
                      <ArrowUp className="size-6" />
                    </span>
                  </button>
                )}

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

            <MessageBox
              onSendMessage={sendMessage}
              isTyping={isTyping}
              handleImageUpload={handleImageUpload}
              onTyping={handleTyping}
            />
          </div>
        </>
      ) : (
        <div className="flex h-full items-center justify-center">
          <p className="pb-3 text-3xl">
            Click on a user or group to start chatting.
          </p>
        </div>
      )}
    </>
  );
};

export default SingleChat;
