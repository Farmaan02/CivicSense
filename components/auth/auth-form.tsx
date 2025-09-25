"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, registerSchema, type LoginFormData, type RegisterFormData } from "@/lib/form-validation"
import { useToastWrapper } from "@/components/ui/toast-wrapper"

interface AuthFormProps {
  type: "login" | "register"
  onSubmit: (data: { email: string; password: string; name?: string }) => Promise<void>
  loading: boolean
}

export function AuthForm({ type, onSubmit, loading }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { showToast, showErrorToast, showSuccessToast } = useToastWrapper()
  const { guestLogin } = useAuth()
  const router = useRouter()

  // Separate form instances for login and register
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    }
  })

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      confirmPassword: "",
    }
  })

  const { register: loginRegister, handleSubmit: handleLoginSubmit, formState: { errors: loginErrors } } = loginForm
  const { register: registerRegister, handleSubmit: handleRegisterSubmit, formState: { errors: registerErrors } } = registerForm

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      await onSubmit({ email: data.email, password: data.password })
      showSuccessToast("Welcome back!", "You have successfully logged in.")
      router.push("/dashboard")
    } catch (error: any) {
      showErrorToast("Login failed", error.message || "Please try again.")
    }
  }

  const onRegisterSubmit = async (data: RegisterFormData) => {
    try {
      await onSubmit({ email: data.email, password: data.password, name: data.name })
      showSuccessToast("Welcome to CivicPulse!", "Your account has been created successfully.")
      router.push("/dashboard")
    } catch (error: any) {
      showErrorToast("Registration failed", error.message || "Please try again.")
    }
  }

  const handleGuestLogin = async () => {
    try {
      await guestLogin()
      showSuccessToast("Welcome as Guest!", "You are now browsing as a guest user.")
      router.push("/")
    } catch (error: any) {
      showErrorToast("Guest login failed", error.message || "Please try again.")
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto civic-card">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary">
          {type === "login" ? "Sign In" : "Create Account"}
        </CardTitle>
        <CardDescription>
          {type === "login" 
            ? "Welcome back to CivicPulse" 
            : "Join CivicPulse to start reporting issues in your community"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {type === "login" ? (
          <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                {...loginRegister("email")}
                className="civic-input"
              />
              {loginErrors.email && <p className="text-sm text-red-500">{String(loginErrors.email.message)}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  {...loginRegister("password")}
                  className="civic-input pl-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:bg-muted rounded-full"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                </Button>
              </div>
              {loginErrors.password && <p className="text-sm text-red-500">{String(loginErrors.password.message)}</p>}
            </div>
            <Button type="submit" className="w-full civic-button" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit(onRegisterSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your full name"
                {...registerRegister("name")}
                className="civic-input"
              />
              {registerErrors.name && <p className="text-sm text-red-500">{String(registerErrors.name.message)}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                {...registerRegister("email")}
                className="civic-input"
              />
              {registerErrors.email && <p className="text-sm text-red-500">{String(registerErrors.email.message)}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  {...registerRegister("password")}
                  className="civic-input pl-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:bg-muted rounded-full"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                </Button>
              </div>
              {registerErrors.password && <p className="text-sm text-red-500">{String(registerErrors.password.message)}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  {...registerRegister("confirmPassword")}
                  className="civic-input pl-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:bg-muted rounded-full"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">{showConfirmPassword ? "Hide password" : "Show password"}</span>
                </Button>
              </div>
              {registerErrors.confirmPassword && <p className="text-sm text-red-500">{String(registerErrors.confirmPassword.message)}</p>}
            </div>
            <Button type="submit" className="w-full civic-button" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        )}
        <div className="mt-4 text-center text-sm text-muted-foreground">
          {type === "login" ? "Don't have an account? " : "Already have an account? "}
          <Button 
            variant="link" 
            className="p-0 h-auto font-normal" 
            onClick={() => router.push(type === "login" ? "/register" : "/login")}
          >
            {type === "login" ? "Sign up here" : "Sign in here"}
          </Button>
        </div>
        <div className="mt-4">
          <Button 
            variant="outline" 
            className="w-full civic-button" 
            onClick={handleGuestLogin}
            disabled={loading}
          >
            Continue as Guest
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}