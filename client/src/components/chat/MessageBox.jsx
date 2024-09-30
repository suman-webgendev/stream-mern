import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { messageSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Paperclip, Send } from "lucide-react";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import EmojiPicker from "./EmojiPicker";
import TypingIndicator from "./TypingIndicator";

const MessageBox = ({
  onSendMessage,
  isTyping,
  handleImageUpload,
  onTyping,
}) => {
  const fileInputRef = useRef(null);

  const form = useForm({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });

  const onSubmit = (values) => {
    onSendMessage(values.content);
    form.reset();
  };

  const handleEmojiSelect = (emoji) => {
    const currentMessage = form.getValues("content");
    form.setValue("content", currentMessage + emoji);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-3">
        <div className="relative">
          {isTyping && <TypingIndicator />}
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter a message..."
                    autoComplete="off"
                    className="bg-[#E0E0E0] py-6 pl-10 pr-24"
                    onChange={(e) => {
                      field.onChange(e);
                      onTyping();
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="absolute bottom-4 left-2">
            <EmojiPicker onEmojiSelect={handleEmojiSelect} />
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            ref={fileInputRef}
          />
          <Paperclip
            onClick={() => fileInputRef?.current.click()}
            className="absolute bottom-4 right-14 z-10 cursor-pointer"
          />
          <Button type="submit" size="sm" className="absolute bottom-2 right-2">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MessageBox;
