import { Skeleton } from "@/components/ui/skeleton";

const ChatLoading = () => {
  return (
    <div className="flex w-full flex-col gap-y-2">
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
    </div>
  );
};

export default ChatLoading;
