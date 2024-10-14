import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Loader, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import ChatLoading from "@/components/chat/ChatLoading";
import NotificationBadge from "@/components/chat/NotificationBadge";
import UserListItem from "@/components/chat/UserListItem";
import ProfileModal from "@/components/modals/ProfileModal";
import { useAuth } from "@/hooks/auth";
import { useAccessChats, useChat, useSearchUser } from "@/hooks/chats";
import { useDebounce } from "@/hooks/useDebounce";
import { getSender } from "@/lib/utils";

import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from "@chakra-ui/react";
import { useMemo } from "react";

const SideDrawer = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [search, setSearch] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useAuth();

  const { chats, setChats, setSelectedChat, notifications, setNotifications } =
    useChat();
  const memoizedSearch = useMemo(() => search, [search]);
  const debouncedSearch = useDebounce(memoizedSearch);

  useEffect(() => {
    if ("Notification" in window) Notification.requestPermission();
  }, []);

  useEffect(() => {
    if (
      notifications.length > 0 &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      const latestNotification = notifications[notifications.length - 1];
      const sender = latestNotification.chat.isGroupChat
        ? latestNotification.chat.chatName
        : getSender(user, latestNotification.chat.users);

      new Notification(`New Message from ${sender}`, {
        body: `Message: ${latestNotification.content}`,
        icon: "/chat.png",
      });
    }
  }, [notifications, user]);

  const { mutateAsync: accessChat, isPending: loadingChats } = useAccessChats(
    setChats,
    chats,
    setSelectedChat,
    toast,
    setSearchResults,
    onClose,
  );

  const {
    mutateAsync: searchUsers,
    isPending,
    isSuccess,
  } = useSearchUser(search, toast, debouncedSearch, setSearchResults);

  return (
    <>
      <div className="flex w-full items-center justify-between border-[5px] bg-white px-2.5 py-1.5">
        <Button variant="ghost" onClick={onOpen} className="font-bold">
          <Search />
          <p className="hidden px-4 md:flex">Search User</p>
        </Button>

        <p className="text-2xl font-bold">Let&apos;s Chat</p>
        <div className="flex items-center">
          <Menu>
            <MenuButton p={1}>
              <NotificationBadge count={notifications?.length}>
                <Bell className="m-1 text-xl" />
              </NotificationBadge>
            </MenuButton>
            <MenuList p={2}>
              {!notifications.length
                ? "No new messages"
                : notifications.map((notification) => (
                    <MenuItem
                      key={notification._id}
                      onClick={() => {
                        setSelectedChat(notification.chat);
                        setNotifications(
                          notifications.filter((n) => n !== notification),
                        );
                      }}
                    >
                      {notification.chat.isGroupChat
                        ? `${notification.chat.chatName}: ${notification.content}`
                        : `${getSender(user, notification.chat.users)}: ${notification.content}`}
                    </MenuItem>
                  ))}
            </MenuList>
          </Menu>

          <ProfileModal user={user}>
            <Avatar className="size-8 cursor-pointer items-center bg-green-300">
              <AvatarImage src="/user.jpg" alt="user" />
              <AvatarFallback className="text-black">
                {user?.name.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
          </ProfileModal>
        </div>
      </div>
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
          <DrawerBody>
            <div className="flex pb-2">
              <Input
                placeholder="Search by name or email"
                className="mr-2"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={() => searchUsers()} isLoading={isPending}>
                Go
              </Button>
            </div>
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
            {loadingChats && <Loader className="ml-auto flex animate-spin" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;
