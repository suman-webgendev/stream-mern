import ChatHeader from "@/components/chat/ChatHeader";
import ChatInput from "@/components/chat/ChatInput";
import ChatSidebar from "@/components/chat/ChatSidebar";
import MessageViewer from "@/components/chat/MessageViewer";

const Chat = () => {
  return (
    <div className="grid grid-cols-[20rem_minmax(0,_1fr)] gap-1">
      <div>
        <ChatSidebar />
      </div>
      <div>
        <ChatHeader />
        <MessageViewer />
        <ChatInput />
      </div>
    </div>
  );
};

export default Chat;
