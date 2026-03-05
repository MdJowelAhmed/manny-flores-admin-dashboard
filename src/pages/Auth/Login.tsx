import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from "@/redux/slices/authSlice";
import type { UserRoleValue } from "@/redux/slices/authSlice";
import { cn } from "@/utils/cn";
import { motion } from "framer-motion";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;


export default function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });
  const demoUsers = [
    {
      id: "1",
      email: "superadmin@example.com",
      password: "password",
      role: "super-admin" as const,
      firstName: "Super",
      lastName: "Admin",
    },
    {
      id: "2",
      email: "admin@example.com",
      password: "password",
      role: "admin" as const,
      firstName: "Admin",
      lastName: "User",
    },
    {
      id: "3",
      email: "marketing@example.com",
      password: "password",
      role: "marketing" as const,
      firstName: "Marketing",
      lastName: "User",
    },
  ];

  const onSubmit = async (data: LoginFormData) => {
    dispatch(loginStart());

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const matchedUser = demoUsers.find(
        (u) => u.email === data.email && u.password === data.password
      );

      if (!matchedUser) {
        dispatch(loginFailure("Invalid email or password"));
        return;
      }

      dispatch(
        loginSuccess({
          user: {
            id: matchedUser.id,
            email: matchedUser.email,
            firstName: matchedUser.firstName,
            lastName: matchedUser.lastName,
            role: matchedUser.role as UserRoleValue,
          },
          token: "mock-jwt-token-" + Date.now(),
        })
      );

      navigate("/dashboard", { replace: true });
    } catch {
      dispatch(loginFailure("An error occurred. Please try again."));
    }
  };


  return (
    <div className="space-y-6">
      {/* Mobile Logo */}
      <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-xl">D</span>
        </div>
        <span className="font-display font-bold text-2xl">Dashboard</span>
      </div>

      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">
          Enter your credentials to access your account
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              className={cn("pl-10", errors.email && "border-destructive")}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className={cn(
                "pl-10 pr-10",
                errors.password && "border-destructive"
              )}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              className="h-4 w-4 rounded border-input"
              {...register("remember")}
            />
            <Label
              htmlFor="remember"
              className="text-sm font-normal cursor-pointer"
            >
              Remember me for 30 days
            </Label>
          </div>
          <Link
            to="/auth/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isLoading}
        >
          {!isLoading && (
            <>
              Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
          Demo Credentials
        </span>
      </div>

      <div className="p-4 rounded-lg bg-muted/50 border text-sm space-y-3">
        <p className="font-semibold text-foreground">Demo Credentials:</p>
        <div className="space-y-2">
          <div>
            <p className="font-medium">Super Admin:</p>
            <p className="text-muted-foreground">superadmin@example.com / password</p>
          </div>
          <div>
            <p className="font-medium">Admin:</p>
            <p className="text-muted-foreground">admin@example.com / password</p>
          </div>
          <div>
            <p className="font-medium">Marketing:</p>
            <p className="text-muted-foreground">marketing@example.com / password</p>
          </div>
        </div>
      </div>
    </div>
  );
}
