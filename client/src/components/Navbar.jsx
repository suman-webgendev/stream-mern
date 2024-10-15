import { Button } from "@/components/ui/button";
import { useAuth, useLogout } from "@/hooks/auth";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, setIsAuthenticated } = useAuth();

  const { mutateAsync: logOut, isPending } = useLogout(
    setIsAuthenticated,
    navigate,
    queryClient,
  );

  return (
    <nav className="sticky left-0 right-0 top-0 z-[1000] flex h-14 items-center justify-between bg-[rgba(0,0,0,.15)] px-6 dark:bg-white/20">
      <div onClick={() => navigate("/")} className="cursor-pointer">
        <img src="/logo.svg" alt="logo" />
      </div>

      <div className="flex items-center justify-between gap-2">
        <ul className="flex items-center justify-between">
          {!isAuthenticated ? (
            <>
              <li>
                <Button variant="link" tabIndex={-1}>
                  <Link to="/register" className="text-lg">
                    Register
                  </Link>
                </Button>
              </li>
              <li>
                <Button variant="link" disabled={isPending} tabIndex={-1}>
                  <Link to="/login" className="text-lg">
                    Login
                  </Link>
                </Button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Button variant="link" disabled={isPending} tabIndex={-1}>
                  <Link to="/" className="text-lg">
                    Videos
                  </Link>
                </Button>
              </li>
              <Button variant="link" disabled={isPending} tabIndex={-1}>
                <Link to="/chats" className="text-lg">
                  Chat
                </Link>
              </Button>
              <Button variant="link" disabled={isPending} tabIndex={-1}>
                <Link to="/pricing" className="text-lg">
                  Payment
                </Link>
              </Button>
              <li>
                <Button
                  variant="link"
                  onClick={async () => await logOut()}
                  className="text-lg"
                  disabled={isPending}
                >
                  Logout
                </Button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
