import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { Button } from "./ui/button";

const Navbar = () => {
  return (
    <nav className="flex h-[8vh] items-center justify-between bg-[rgba(0,0,0,.5)] px-6 dark:bg-white/20">
      <div>
        <img src="/logo.svg" alt="logo" />
      </div>

      <div className="flex items-center justify-between gap-2">
        <ul className="flex items-center justify-between">
          <li>
            <Button variant="link" tabIndex={-1}>
              <Link to="/register" className="text-lg">
                Register
              </Link>
            </Button>
          </li>
          <li>
            <Button variant="link" tabIndex={-1}>
              <Link to="/login" className="text-lg">
                Login
              </Link>
            </Button>
          </li>
        </ul>
        <ThemeToggle />
      </div>
    </nav>
  );
};

export default Navbar;
