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
import { useChat, useGroupChatCreate, useSearchUser } from "@/hooks/chats";
import { useDebounce } from "@/hooks/useDebounce";
import { FormControl } from "@chakra-ui/react";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const GroupChatModal = ({ children }) => {
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [open, setOpen] = useState(false);

  const { chats, setChats } = useChat();

  const { mutateAsync: createGroup } = useGroupChatCreate(
    selectedUsers,
    setChats,
    chats,
    toast,
    setOpen,
  );

  const handleSubmit = useCallback(() => {
    if (!groupChatName || !selectedUsers) {
      toast.warning("Please fill all the fields", {
        duration: 3000,
        position: "bottom-right",
        dismissible: true,
      });
      return;
    }

    createGroup(groupChatName);
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

  const memoizedSearch = useMemo(() => searchQuery, [searchQuery]);
  const debouncedInput = useDebounce(memoizedSearch, 300);

  const { mutateAsync: search, isPending } = useSearchUser(
    searchQuery,
    toast,
    debouncedInput,
    setSearchResults,
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
