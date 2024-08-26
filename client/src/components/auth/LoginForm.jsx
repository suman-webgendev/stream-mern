import CardWrapper from "@/components/auth/CardWrapper";
import FormError from "@/components/auth/FormError";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/utils";
import { loginSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    mutateAsync: login,
    isError,
    error,
    isPending,
  } = useMutation({
    mutationFn: async (values) => {
      const response = await api.post("/auth/login", values);
      return response.data;
    },
    onSuccess: () => {
      navigate("/");
      navigate(0);
    },
  });

  const onSubmit = async (values) => {
    await login(values);
  };

  return (
    <CardWrapper
      headerLabel="Welcome back"
      backButtonLabel="Don't have an account?"
      backButtonHref="/register"
      showSocial
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      tabIndex={0}
                      {...field}
                      type="email"
                      disabled={isPending}
                      placeholder="john.doe@example.com"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="relative">
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <>
                      <Input
                        tabIndex={0}
                        disabled={isPending}
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="**********"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-8 z-10"
                        onClick={() => setShowPassword((prev) => !prev)}
                        tabIndex={1}
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </button>
                    </>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {isError && (
            <FormError
              message={error?.response?.data?.message || "An error occurred"}
            />
          )}

          <Button
            disabled={isPending}
            type="submit"
            tabIndex={0}
            className="w-full"
          >
            Login
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default LoginForm;
