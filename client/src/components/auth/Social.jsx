import { Button } from "@/components/ui/button";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

const Social = () => {
  // const naviagte = useNavigate()
  // const handleGoogleLogin = () => {

  // }
  return (
    <div className="flex w-full items-center gap-x-2">
      <Button size="lg" className="w-full" variant="outline" onClick={() => {}}>
        <FcGoogle className="size-5" />
      </Button>
      <Button size="lg" className="w-full" variant="outline" onClick={() => {}}>
        <FaGithub className="size-5" />
      </Button>
    </div>
  );
};

export default Social;
