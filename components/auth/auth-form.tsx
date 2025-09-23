"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/lib/auth"

interface AuthFormProps {
  type: "login" | "register"
  onSubmit: (data: { email: string; password: string; name?: string }) => Promise<void>
  loading: boolean
}

export function AuthForm({ type, onSubmit, loading }: AuthFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { toast } = useToast()
  const { guestLogin } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (type === "register" && password !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      })
      return
    }

    try {
      const data: { email: string; password: string; name?: string } = { email, password }
      if (type === "register") {
        data.name = name
      }
      await onSubmit(data)
      
      if (type === "register") {
        toast({
          title: "Welcome to CivicSense!",
          description: "Your account has been created successfully.",
        })
        router.push("/dashboard")
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        })
        router.push("/dashboard")
      }
    } catch (error: any) {
      toast({
        title: type === "login" ? "Login failed" : "Registration failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleGuestLogin = async () => {
    try {
      await guestLogin()
      toast({
        title: "Welcome as Guest!",
        description: "You are now browsing as a guest user.",
      })
      router.push("/")
    } catch (error: any) {
      toast({
        title: "Guest login failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary">
          {type === "login" ? "Sign In" : "Create Account"}
        </CardTitle>
        <CardDescription>
          {type === "login" 
            ? "Welcome back to CivicSense" 
            : "Join CivicSense to start reporting issues in your community"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {type === "register" && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={type === "register"}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
              </Button>
            </div>
          </div>
          {type === "register" && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required={type === "register"}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">{showConfirmPassword ? "Hide password" : "Show password"}</span>
                </Button>
              </div>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (type === "login" ? "Signing in..." : "Creating account...") : (type === "login" ? "Sign In" : "Create Account")}
          </Button>
        </form>
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
            className="w-full" 
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