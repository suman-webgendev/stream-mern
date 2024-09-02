import { Input } from "@/components/ui/input";
import { useCallback, useRef } from "react";
import { Button } from "../ui/button";
import EmojiPicker from "./EmojiPicker";

const ChatInput = () => {
  const inputRef = useRef(null);

  const handleMessageSend = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const message = formData.get("message");
    alert(message);
    e.target.reset();
  };

  const handleEmojiSelect = useCallback((emoji) => {
    if (inputRef.current) {
      const input = inputRef.current;
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const text = input.value;
      input.value = text.substring(0, start) + emoji + text.substring(end);
      input.setSelectionRange(start + emoji.length, start + emoji.length);
      input.focus();
    }
  }, []);

  return (
    <form className="flex w-full gap-2" onSubmit={handleMessageSend}>
      <Input
        ref={inputRef}
        type="text"
        autoComplete="off"
        className="relative w-full"
        placeholder="Type something..."
        name="message"
        autoFocus
      />
      <div className="absolute bottom-2 right-20">
        <EmojiPicker onEmojiSelect={handleEmojiSelect} />
      </div>
      <Button>Send</Button>
    </form>
  );
};

export default ChatInput;
