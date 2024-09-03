import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { api } from "@/lib/utils";
import { BellIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Input,
  Menu,
  MenuButton,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useState } from "react";
import ChatLoading from "./ChatLoading";
import UserListItem from "./UserListItem";

const SideDrawer = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [search, setSearch] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useAuth();
  const toast = useToast();
  const { chats, setChats, setSelectedChat } = useChat();

  const { mutateAsync: accessChat } = useMutation({
    mutationFn: async (userId) => {
      const { data } = await api.post("/api/chat", { userId });
      return data;
    },
    onSuccess: (data) => {
      setSelectedChat(data);
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
    onSettled: () => {
      onClose();
    },
  });

  const {
    mutateAsync: searchUsers,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: async () => {
      if (!search.trim()) {
        toast({
          title: "Search failed",
          description: "Please enter something to search",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
      const { data } = await api.get(`/api/chat/find-user?search=${search}`);
      return data;
    },
    onSuccess: (data) => {
      setSearchResults(data);
    },
    onError: (error) => {
      setSearchResults([]);
      toast({
        title: "Search failed",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const handleSearch = () => {
    searchUsers();
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="white"
        w="100%"
        p="5px 10px 5px 10px"
        borderWidth="5px"
      >
        <Tooltip
          label="Search users to start a chat"
          hasArrow
          placement="bottom-end"
        >
          <Button variant="ghost" onClick={onOpen}>
            <Search />
            <Text display={{ base: "none", md: "flex" }} px="4">
              Search User
            </Text>
          </Button>
        </Tooltip>
        <Text fontSize="2xl" fontWeight="bold">
          Let&apos;s Chat
        </Text>
        <div>
          <Menu>
            <MenuButton p={1}>
              <BellIcon fontSize="2xl" m={1} />
            </MenuButton>
            {/* <MenuList></MenuList> */}
          </Menu>
          <Avatar
            size="sm"
            cursor="pointer"
            name={user?.name}
            alignItems="center"
          />
        </div>
      </Box>
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
          <DrawerBody>
            <Box display="flex" pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch} isLoading={isPending}>
                Go
              </Button>
            </Box>
            {!isSuccess && isPending && <ChatLoading />}
            {!isPending &&
              isSuccess &&
              searchResults?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleClick={() => accessChat(user._id)}
                />
              ))}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;
