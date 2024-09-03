import { Card, CardContent, CardHeader } from "../ui/card";
import ChatAvatar from "./ChatAvatar";

const SearchUserCard = ({ user, onClick }) => {
  return (
    <Card className="w-full cursor-pointer" onClick={onClick}>
      <CardHeader className="flex flex-row justify-start gap-2 p-1 font-bold">
        <div>
          <ChatAvatar src="/one.svg" name={user.name} />
        </div>
        <div>{user.name}</div>
      </CardHeader>
      <CardContent>
        <span className="font-bold">Email:</span> {user.email}
      </CardContent>
    </Card>
  );
};

export default SearchUserCard;
