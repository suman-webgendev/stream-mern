import UserBadgeItem from "@/components/chat/UserBadgeItem";
import UserListItem from "@/components/chat/UserListItem";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useChat } from "@/hooks/useChat";
import { useDebounce } from "@/hooks/useDebounce";
import { api } from "@/lib/utils";
import { FormControl } from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const GroupChatModal = ({ children }) => {
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const { chats, setChats } = useChat();

  const { mutateAsync: createGroup } = useMutation({
    mutationFn: async () => {
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
    onSettled: () => {},
  });

  const handleSubmit = useCallback(() => {
    if (!groupChatName || !selectedUsers) {
      toast.warning("Please fill all the fields", {
        duration: 3000,
        position: "bottom-right",
        dismissible: true,
      });
      return;
    }

    createGroup();
  }, [createGroup, groupChatName, selectedUsers]);

  const handleDelete = useCallback(
    (user) => {
      setSelectedUsers(selectedUsers.filter((sel) => sel._id !== user._id));
    },
    [selectedUsers],
  );

  const handleGroup = useCallback(
    (userToAdd) => {
      if (selectedUsers.includes(userToAdd)) {
        toast.warning("User already exist", {
          description: "User already exist in the group",
          duration: 3000,
          position: "bottom-right",
          dismissible: true,
        });
        return;
      }
      setSelectedUsers([...selectedUsers, userToAdd]);
    },
    [selectedUsers],
  );

  const debouncedInput = useDebounce(searchQuery, 300);

  const { mutateAsync: search, isPending } = useMutation({
    mutationFn: async (query) => {
      if (!query) return [];
      const { data } = await api.get(`/api/chat/find-user?search=${query}`);
      return data;
    },
    onSuccess: (data) => {
      setSearchResults(data);
    },
    onError: (error) => {
      setSearchResults([]);
      toast.error("Error fetching the chat.", {
        description: error.message,
        duration: 3000,
        position: "bottom-left",
        dismissible: true,
      });
    },
  });

  useEffect(() => {
    if (debouncedInput) {
      search(debouncedInput);
    } else {
      setSearchResults([]);
    }
  }, [debouncedInput, search]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <span>{children}</span>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex justify-center text-4xl">
            Create Group Chat
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center">
          <FormControl>
            <Input
              type="text"
              placeholder="Group Name"
              className="mb-3"
              onChange={(e) => setGroupChatName(e.target.value)}
            />
          </FormControl>

          <FormControl>
            <Input
              type="text"
              placeholder="Add users, eg: John, Jane"
              className="mb-3"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </FormControl>

          <div className="flex w-full flex-wrap">
            {selectedUsers.map((u) => (
              <UserBadgeItem
                key={u._id}
                user={u}
                handleClick={() => handleDelete(u)}
              />
            ))}
          </div>
          {isPending ? (
            <Loader2 className="size-6 animate-spin" />
          ) : (
            searchResults.length > 0 &&
            searchResults
              ?.slice(0, 4)
              .map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleClick={() => handleGroup(user)}
                />
              ))
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit}>Create Group</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GroupChatModal;
