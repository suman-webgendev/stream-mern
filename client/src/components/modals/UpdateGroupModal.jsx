import UserBadgeItem from "@/components/chat/UserBadgeItem";
import UserListItem from "@/components/chat/UserListItem";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { useDebounce } from "@/hooks/useDebounce";
import { api } from "@/lib/utils";
import {
  Button,
  FormControl,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const UpdateGroupModal = () => {
  const [groupChatName, setGroupChatName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { selectedChat, setSelectedChat } = useChat();

  const { user: currentUser } = useAuth();

  const debouncedInput = useDebounce(searchQuery, 300);

  const { mutateAsync: search, isPending: isLoadingSearch } = useMutation({
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
      toast({
        title: "Error fetching the chat.",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const { mutateAsync: rename, isPending: renameLoading } = useMutation({
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
      toast({
        title: "Error renaming the group.",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["AllChats"] });
      setGroupChatName("");
    },
  });

  const { mutateAsync: addUser } = useMutation({
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
      toast({
        title: "Error adding a new member to the group.",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["AllChats"] });
    },
  });

  const { mutateAsync: removeUser } = useMutation({
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
      toast({
        title: "Error removing member to the group.",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["AllChats"] });
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

  const handleGroup = useCallback(
    (userToAdd) => {
      if (selectedChat.users.find((u) => u._id === userToAdd._id)) {
        toast({
          title: "User already exist",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "bottom",
        });
        return;
      }

      if (selectedChat.groupAdmin._id !== currentUser._id) {
        toast({
          title: "Only admins can add a new member",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "bottom",
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
        toast({
          title: "Only admins can remove a member",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "bottom",
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
      toast({
        title: "Only admins can rename the group",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    rename();
  }, [rename, groupChatName, currentUser, selectedChat]);

  return (
    <>
      <IconButton
        display={{ base: "flex" }}
        icon={<Pencil />}
        onClick={onOpen}
      />

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="35px" display="flex" justifyContent="center">
            {selectedChat.chatName}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
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
                mb={3}
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
              <Button
                variant="solid"
                colorScheme="teal"
                ml={1}
                isLoading={renameLoading}
                onClick={handleRename}
              >
                Update
              </Button>
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add users to the group"
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
            {isLoadingSearch ? (
              <Spinner size="lg" />
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
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="red" onClick={() => handleRemove(currentUser)}>
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupModal;
