import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ChatAvatar = ({ src, name }) => {
  return (
    <Avatar>
      <AvatarImage src={src} alt="userAvatar" />
      <AvatarFallback>{name[0]}</AvatarFallback>
    </Avatar>
  );
};
export default ChatAvatar;
