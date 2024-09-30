import { X } from "lucide-react";

const UserBadgeItem = ({ user, handleClick }) => {
  return (
    <div
      className="m-1 mb-2 flex cursor-pointer rounded-lg bg-purple-500 px-2 py-1 text-base text-white"
      onClick={handleClick}
    >
      {user.name}
      <X className="pl-1" />
    </div>
  );
};

export default UserBadgeItem;
