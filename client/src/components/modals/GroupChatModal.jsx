import { useChat } from "@/hooks/useChat";
import { useDebounce } from "@/hooks/useDebounce";
import { api } from "@/lib/utils";
import {
  Box,
  Button,
  FormControl,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import UserBadgeItem from "../chat/UserBadgeItem";
import UserListItem from "../chat/UserListItem";

const GroupChatModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const toast = useToast();
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
      onClose();
      toast({
        title: "New Group Created",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create group",
        description: error.response.data,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const handleSubmit = useCallback(() => {
    if (!groupChatName || !selectedUsers) {
      toast({
        title: "Please fill all the fields",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    createGroup();
  }, [createGroup, groupChatName, selectedUsers, toast]);

  const handleDelete = useCallback(
    (user) => {
      setSelectedUsers(selectedUsers.filter((sel) => sel._id !== user._id));
    },
    [selectedUsers],
  );

  const handleGroup = useCallback(
    (userToAdd) => {
      if (selectedUsers.includes(userToAdd)) {
        toast({
          title: "User already exist",
          status: "warning",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
        return;
      }
      setSelectedUsers([...selectedUsers, userToAdd]);
    },
    [selectedUsers, toast],
  );

  const debouncedInput = useDebounce(searchQuery);

  const { mutateAsync: search, isPending } = useMutation({
    mutationFn: async () => {
      const { data } = await api.get(
        `/api/chat/find-user?search=${debouncedInput}`,
      );
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

  const handleSearch = useCallback(
    (query) => {
      if (!query) return;
      setSearchQuery(query);
      search();
    },
    [search],
  );

  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
          >
            Create Group Chat
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody display="flex" flexDir="column" alignItems="center">
            <FormControl>
              <Input
                type="text"
                placeholder="Group Name"
                mb={3}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <Input
                type="text"
                placeholder="Add users, eg: John, Jane"
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
            <Box w="100%" display="flex" flexWrap="wrap">
              {selectedUsers.map((u) => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  handleClick={() => handleDelete(u)}
                />
              ))}
            </Box>
            {isPending ? (
              <div>loading...</div>
            ) : (
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
            <Button colorScheme="blue" onClick={handleSubmit}>
              Create Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModal;
