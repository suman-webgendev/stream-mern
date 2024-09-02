import { Card, CardHeader } from "../ui/card";

const OneToOneChat = ({ chat, currentUser }) => {
  return (
    <Card className="mb-2 cursor-pointer">
      <CardHeader className="flex flex-row items-center gap-2 text-center">
        <svg
          id="userIcon"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-users-round text-black dark:text-white"
        >
          <circle cx="12" cy="8" r="5" />
          <path d="M20 21a8 8 0 0 0-16 0" />
        </svg>
        <p>{chat.users.find((user) => user._id !== currentUser._id)?.name}</p>
      </CardHeader>
    </Card>
  );
};

export default OneToOneChat;
