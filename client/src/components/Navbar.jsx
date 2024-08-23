import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const {
    mutateAsync: logOut,
    data,
    isError,
    error,
    isPending,
  } = useMutation({
    mutationFn: async () => {
      const response = await api.post("/auth/logout");
      return response.data;
    },
    onSuccess: () => {
      navigate("/login");
      navigate(0);
    },
  });

  console.log(data, isError, error);

  const handleSignOut = async () => {
    await logOut();
  };

  const { isAuthenticated, user } = useAuth();
  console.log("isAuthenticated", isAuthenticated);
  console.log(user);
  return (
    <nav className="sticky left-0 right-0 top-0 flex h-[8vh] items-center justify-between bg-[rgba(0,0,0,.5)] px-6 dark:bg-white/20">
      <div>
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
            <li>
              <Button
                variant="link"
                onClick={handleSignOut}
                className="text-lg"
                tabIndex={1}
              >
                Logout
              </Button>
            </li>
          )}
        </ul>

        <ThemeToggle />
      </div>
    </nav>
  );
};

export default Navbar;
