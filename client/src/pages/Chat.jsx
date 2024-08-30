import ChatInput from "@/components/chat/ChatInput";
import EmojiPicker from "@/components/chat/EmojiPicker";
import MessageContainer from "@/components/chat/MessageContainer";

const Chat = () => {
  return (
    <div>
      <MessageContainer />
      <div className="flex items-center justify-between">
        <ChatInput />
        <EmojiPicker />
      </div>
    </div>
  );
};

export default Chat;
