import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ProfileModal = ({ user, children }) => {
  return (
    <Dialog>
      <DialogTrigger>
        <span>{children}</span>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex justify-center text-4xl">
            {user.name}
          </DialogTitle>
        </DialogHeader>
        <DialogClose />
        <div className="flex flex-col items-center justify-center">
          <Avatar className="size-28">
            <AvatarImage src="/user.jpg" alt="user" />
            <AvatarFallback>{user.name.slice(0, 1)}</AvatarFallback>
          </Avatar>

          <p className="mt-2 text-2xl md:text-3xl">
            <strong>Email:</strong> {user.email}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
