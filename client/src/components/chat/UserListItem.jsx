import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const UserListItem = ({ user, handleClick }) => {
  return (
    <div
      onClick={handleClick}
      className="mb-2 flex w-full cursor-pointer items-center rounded-lg bg-[#e8e8e8] p-3 text-black hover:bg-[#38b2ac] hover:text-white"
    >
      <Avatar>
        <AvatarImage src="/user.jpg" alt="user" />
        <AvatarFallback>{user?.name.slice(0, 1)}</AvatarFallback>
      </Avatar>
      <div>
        <p>{user?.name}</p>
        <p className="text-sm">
          <b>Email: </b>
          {user?.email}
        </p>
      </div>
    </div>
  );
};

export default UserListItem;
