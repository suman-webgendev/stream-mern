import UserBadgeItem from "@/components/chat/UserBadgeItem";
import UserListItem from "@/components/chat/UserListItem";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/auth";
import {
  useAddMember,
  useChat,
  useGroupRename,
  useRemoveMember,
  useSearchUser,
} from "@/hooks/chats";
import { useDebounce } from "@/hooks/useDebounce";
import { FormControl } from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const UpdateGroupModal = () => {
  const [groupChatName, setGroupChatName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { selectedChat, setSelectedChat } = useChat();
  const { user: currentUser } = useAuth();
  const memoizedSearch = useMemo(() => searchQuery, [searchQuery]);
  const debouncedInput = useDebounce(memoizedSearch, 300);

  const { mutateAsync: search, isPending: isLoadingSearch } = useSearchUser(
    searchQuery,
    toast,
    debouncedInput,
    setSearchResults,
  );

  const { mutateAsync: rename, isPending: renameLoading } = useGroupRename(
    setSelectedChat,
    setSearchResults,
    toast,
    setGroupChatName,
    selectedChat,
    groupChatName,
    queryClient,
  );

  const { mutateAsync: addUser } = useAddMember(
    selectedChat,
    setSelectedChat,
    setSearchResults,
    toast,
    queryClient,
  );

  const { mutateAsync: removeUser } = useRemoveMember(
    selectedChat,
    currentUser,
    setSelectedChat,
    setSearchResults,
    queryClient,
    toast,
  );

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

  const handleGroup = useCallback(
    (userToAdd) => {
      if (selectedChat.users.find((u) => u._id === userToAdd._id)) {
        toast.warning("User already exist", {
          dismissible: true,
          duration: 3000,
          position: "bottom-right",
        });
        return;
      }

      if (selectedChat.groupAdmin._id !== currentUser._id) {
        toast.warning("Only admins can add new member.", {
          dismissible: true,
          duration: 3000,
          position: "bottom-right",
        });
        return;
      }
      addUser(userToAdd);
    },
    [selectedChat, currentUser, addUser],
  );

  const handleRemove = useCallback(
    (userToRemove) => {
      if (selectedChat.groupAdmin._id !== currentUser._id) {
        toast.warning("Only admins can remove a member.", {
          dismissible: true,
          duration: 3000,
          position: "bottom-right",
        });
        return;
      }
      removeUser(userToRemove);
    },
    [currentUser, selectedChat, removeUser],
  );

  const handleRename = useCallback(() => {
    if (!groupChatName) return;
    if (selectedChat.groupAdmin._id !== currentUser._id) {
      toast.warning("Only admins can add new member.", {
        dismissible: true,
        duration: 3000,
        position: "bottom-right",
      });
      return;
    }
    rename();
  }, [rename, groupChatName, currentUser, selectedChat]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex">
          <Pencil />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader className="flex justify-center text-4xl">
          {selectedChat.chatName}
        </DialogHeader>

        <div className="flex w-full flex-wrap pb-3">
          {selectedChat.users.map((user) => (
            <UserBadgeItem
              key={user._id}
              user={user}
              handleClick={() => handleRemove(user)}
            />
          ))}
        </div>
        <FormControl display="flex">
          <Input
            placeholder="Group Name"
            className="mb-3 mr-2"
            value={groupChatName}
            onChange={(e) => setGroupChatName(e.target.value)}
          />
          <Button
            className="ml-1 bg-teal-400 hover:bg-teal-500"
            isLoading={renameLoading}
            onClick={handleRename}
          >
            Update
          </Button>
        </FormControl>
        <FormControl>
          <Input
            placeholder="Add users to the group"
            className="mb-1"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </FormControl>
        {isLoadingSearch ? (
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

        <DialogFooter>
          <Button
            className="bg-red-500"
            onClick={() => handleRemove(currentUser)}
          >
            Leave Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateGroupModal;
