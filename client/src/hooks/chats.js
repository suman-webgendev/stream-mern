import { ChatContext } from "@/components/providers/ChatProvider";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { api } from "../lib/utils";

export const useChat = () => {
  const context = useContext(ChatContext);

  if (context === undefined)
    throw new Error("useChat must be used within a ChatProvider");

  return context;
};

export const useAllChats = (setChats) => {
  return useQuery({
    queryKey: ["AllChats"],
    queryFn: async () => {
      const { data } = await api.get("/api/chat");
      setChats(Array.isArray(data) ? data : []);
      return null;
    },
  });
};

export const useAccessChats = (
  setChats,
  chats,
  setSelectedChat,
  toast,
  setSearchResults,
  onClose,
) => {
  return useMutation({
    mutationFn: async (userId) => {
      const { data } = await api.post("/api/chat", { userId });
      return data;
    },
    onSuccess: (data) => {
      if (!chats.find((c) => c._id === data._id)) setChats(data, ...chats);
      setSelectedChat(data);
    },
    onError: (error) => {
      setSearchResults([]);
      toast.error("Error fetching the chat.", {
        description: error.message,
        duration: 3000,
        dismissible: true,
      });
    },
    onSettled: () => {
      onClose();
    },
  });
};

export const useSearchUser = (
  search,
  toast,
  debouncedSearch,
  setSearchResults,
) => {
  return useMutation({
    mutationFn: async () => {
      if (!search.trim()) {
        toast.error("Search failed", {
          description: "Please enter something to search",
          dismissible: true,
          duration: 3000,
        });
      }
      const { data } = await api.get(
        `/api/chat/find-user?search=${debouncedSearch}`,
      );
      return data;
    },
    onSuccess: (data) => {
      setSearchResults(data);
    },
    onError: (error) => {
      setSearchResults([]);
      toast.error("Search failed", {
        description: error.message,
        dismissible: true,
        duration: 3000,
      });
    },
  });
};

export const useGroupChatCreate = (
  selectedUsers,
  setChats,
  chats,
  toast,
  setOpen,
) => {
  return useMutation({
    mutationFn: async (groupChatName) => {
      const { data } = await api.post("/api/chat/group/create", {
        name: groupChatName,
        users: JSON.stringify(selectedUsers.map((user) => user._id)),
      });
      return data;
    },
    onSuccess: (data) => {
      setChats([data, ...chats]);
      toast.success("New Group Created", {
        description: "Group created successfully!",
        duration: 3000,
        position: "bottom-right",
        dismissible: true,
      });
    },
    onError: (error) => {
      toast.error("Failed to create group", {
        description: error.response.data.message,
        duration: 3000,
        position: "bottom-right",
        dismissible: true,
      });
    },
    onSettled: () => {
      setOpen(false);
    },
  });
};

export const useGroupRename = (
  setSelectedChat,
  setSearchResults,
  toast,
  setGroupChatName,
  selectedChat,
  groupChatName,
  queryClient,
) => {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.put("/api/chat/group/rename", {
        groupId: selectedChat._id,
        groupName: groupChatName,
      });
      return data;
    },
    onSuccess: (data) => {
      setSelectedChat(data);
    },
    onError: (error) => {
      setSearchResults([]);
      toast.error("Error renaming the group!", {
        description: error.message,
        dismissible: true,
        duration: 3000,
        position: "bottom-right",
      });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["AllChats"] });
      setGroupChatName("");
    },
  });
};

export const useAddMember = (
  selectedChat,
  setSelectedChat,
  setSearchResults,
  toast,
  queryClient,
) => {
  return useMutation({
    mutationFn: async (user) => {
      const { data } = await api.put("/api/chat/group/add", {
        groupId: selectedChat._id,
        userId: user._id,
      });
      return data;
    },
    onSuccess: (data) => {
      setSelectedChat(data);
    },
    onError: (error) => {
      setSearchResults([]);
      toast.error("Error adding a new member to the group.", {
        description: error.message,
        dismissible: true,
        duration: 3000,
        position: "bottom-right",
      });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["AllChats"] });
    },
  });
};

export const useRemoveMember = (
  selectedChat,
  currentUser,
  setSelectedChat,
  setSearchResults,
  queryClient,
  toast,
) => {
  return useMutation({
    mutationFn: async (user) => {
      const { data } = await api.put("/api/chat/group/remove", {
        groupId: selectedChat._id,
        userId: user._id,
      });

      return data;
    },
    onSuccess: (data, user) => {
      user._id === currentUser._id ? setSelectedChat() : setSelectedChat(data);
    },
    onError: (error) => {
      setSearchResults([]);
      toast.error("Error removing member to the group.", {
        description: error.message,
        dismissible: true,
        duration: 3000,
        position: "bottom-right",
      });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["AllChats"] });
    },
  });
};
