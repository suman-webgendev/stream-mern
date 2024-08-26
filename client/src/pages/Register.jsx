import RegisterForm from "@/components/auth/RegisterForm";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

const Register = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return (
    <div className="flex h-full flex-col items-center justify-center p-24">
      <RegisterForm />
    </div>
  );
};

export default Register;
