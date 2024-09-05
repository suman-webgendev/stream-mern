import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { Smile } from "lucide-react";
import { useState } from "react";

const EmojiPicker = ({ onEmojiSelect, emojiPickerRef }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleEmojiSelect = (emoji) => {
    onEmojiSelect(emoji.native);
    setIsOpen(true);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Smile
          onClick={() => setIsOpen(!isOpen)}
          ref={emojiPickerRef}
          className="cursor-pointer text-zinc-500 transition hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300"
        />
      </PopoverTrigger>
      <PopoverContent
        side="right"
        sideOffset={40}
        className="mb-16 border-none bg-transparent shadow-none drop-shadow-none"
      >
        <Picker data={data} onEmojiSelect={handleEmojiSelect} />
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPicker;
