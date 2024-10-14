import LoginForm from "@/components/auth/LoginForm";
import { useAuth } from "@/hooks/auth";
import { Navigate } from "react-router-dom";

const Login = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return (
    <div className="flex h-screen flex-col items-center justify-center p-24">
      <LoginForm />
    </div>
  );
};

export default Login;
