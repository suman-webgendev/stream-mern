import { Skeleton } from "@/components/ui/skeleton";

const LoadingChats = () => {
  return (
    <div className="flex flex-col space-y-1">
      <Skeleton className="h-20 w-[332px] rounded-xl" />
      <Skeleton className="h-20 w-[332px] rounded-xl" />
      <Skeleton className="h-20 w-[332px] rounded-xl" />
      <Skeleton className="h-20 w-[332px] rounded-xl" />
      <Skeleton className="h-20 w-[332px] rounded-xl" />
      <Skeleton className="h-20 w-[332px] rounded-xl" />
    </div>
  );
};
export default LoadingChats;
