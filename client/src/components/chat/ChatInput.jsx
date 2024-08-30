import EmojiPicker from "@/components/chat/EmojiPicker";
import { Input } from "@/components/ui/input";

const ChatInput = () => {
  return (
    <form>
      <Input
        disabled={false}
        className="border-0 border-none bg-zinc-200/90 px-14 py-6 text-zinc-600 focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-zinc-700/75 dark:text-zinc-200"
        autoComplete="off"
      />
      <div className="absolute right-8 top-7">
        <EmojiPicker />
      </div>
    </form>
  );
};

export default ChatInput;
