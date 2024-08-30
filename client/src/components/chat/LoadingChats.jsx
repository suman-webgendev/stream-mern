import { Loader2 } from "lucide-react";

const LoadingChats = () => {
  return (
    <div className="flex size-full items-center justify-center">
      <Loader2 className="size-4 animate-spin" />
    </div>
  );
};

export default LoadingChats;
