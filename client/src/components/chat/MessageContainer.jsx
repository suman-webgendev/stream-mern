import { ScrollArea } from "../ui/scroll-area";
import MyMessage from "./MyMessage";
import YourMessage from "./YourMessage";

const MessageContainer = () => {
  return (
    <ScrollArea className="h-[82vh] w-full">
      <div className="flex w-full flex-col p-2.5">
        <MyMessage />
        <YourMessage />
        <MyMessage />
        <YourMessage />
        <MyMessage />
        <YourMessage />
        <MyMessage />
        <YourMessage />
        <MyMessage />
        <YourMessage />
        <MyMessage />
        <YourMessage />
        <MyMessage />
        <YourMessage />
        <MyMessage />
        <YourMessage />
        <MyMessage />
        <YourMessage />
      </div>
    </ScrollArea>
  );
};

export default MessageContainer;
