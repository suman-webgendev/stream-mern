import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useChat } from "@/hooks/useChat";
import { useDebounce } from "@/hooks/useDebounce";
import { api } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import LoadingChats from "./LoadingChats";
import SearchUserCard from "./SearchUserCard";

const SearchUser = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { setSelectedChat } = useChat();

  const queryClient = useQueryClient();

  const debouncedInput = useDebounce(input);

  const accessChat = useCallback(
    async (userId) => {
      try {
        setLoading(true);
        const { data } = await api.post("/api/chat", { userId });

        setSelectedChat(data);
        setIsOpen(false);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [setSelectedChat],
  );

  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["SearchUsers", debouncedInput],
    queryFn: async () => {
      const searchParam = debouncedInput ? `?search=${debouncedInput}` : "";
      const res = await api.get(`/api/chat/find-user${searchParam}`);
      return res.data;
    },
    enabled: true,
  });

  useEffect(() => {
    queryClient.invalidateQueries(["SearchUsers"]);
  }, [debouncedInput, queryClient]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="my-1 w-full justify-between">
          Search <Search />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="z-[99999999]">
        <SheetHeader>
          <SheetTitle>Search other users here</SheetTitle>
          <SheetDescription>
            Enter their name or email to search.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-1 py-2">
          <Label htmlFor="name">Name or Email</Label>
          <Input
            autoComplete="off"
            id="name"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="col-span-3"
            placeholder="Enter name or email"
          />
        </div>
        <SheetFooter className="grid grid-cols-1 gap-1 self-center">
          <div>
            {!error && users?.length === 0 && <div>No users found!</div>}
            {isLoading && <LoadingChats />}
            {users?.map((user) => (
              <div key={user._id} className="mb-1">
                <SearchUserCard
                  user={user}
                  onClick={() => accessChat(user._id)}
                />
              </div>
            ))}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default SearchUser;
