"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CivicPulseSVGLogo } from "@/components/ui/svg-logo"
import { Shield, User, Key } from "lucide-react"
import { useAdminAuth } from "@/hooks/use-admin-auth"

export function AdminAuth() {
  const { login, loginAsGuest, loading, error } = useAdminAuth()
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [guestPassword, setGuestPassword] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(credentials.username, credentials.password)
  }

  const handleGuestLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    await loginAsGuest(guestPassword)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md civic-card">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center justify-center">
            <CivicPulseSVGLogo size={48} variant="icon" />
          </div>
          <CardTitle className="text-2xl">Admin Portal</CardTitle>
          <CardDescription>Sign in to access the administrative dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="admin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted p-1">
              <TabsTrigger value="admin" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <User className="h-4 w-4" />
                Admin Login
              </TabsTrigger>
              <TabsTrigger value="guest" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Key className="h-4 w-4" />
                Guest Access
              </TabsTrigger>
            </TabsList>

            <TabsContent value="admin" className="space-y-4 mt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username or Email</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username or email"
                    value={credentials.username}
                    onChange={(e) => setCredentials((prev) => ({ ...prev, username: e.target.value }))}
                    required
                    className="civic-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
                    required
                    className="civic-input"
                  />
                </div>
                <Button type="submit" className="w-full civic-button" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="text-sm text-muted-foreground space-y-1 p-3 bg-muted/50 rounded-lg">
                <p>
                  <strong>Demo Credentials:</strong>
                </p>
                <p>
                  Username: <code className="bg-background px-1 rounded">admin</code> | Password: <code className="bg-background px-1 rounded">admin123</code>
                </p>
                <p>
                  Username: <code className="bg-background px-1 rounded">moderator</code> | Password: <code className="bg-background px-1 rounded">mod123</code>
                </p>
              </div>
            </TabsContent>

            <TabsContent value="guest" className="space-y-4 mt-4">
              <form onSubmit={handleGuestLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="guestPassword">Guest Password</Label>
                  <Input
                    id="guestPassword"
                    type="password"
                    placeholder="Enter guest password"
                    value={guestPassword}
                    onChange={(e) => setGuestPassword(e.target.value)}
                    required
                    className="civic-input"
                  />
                </div>
                <Button type="submit" className="w-full civic-button" disabled={loading}>
                  {loading ? "Accessing..." : "Access as Guest"}
                </Button>
              </form>

              <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                <p>
                  <strong>Guest Access:</strong>
                </p>
                <p>
                  Password: <code className="bg-background px-1 rounded">guest123</code>
                </p>
                <p>Limited permissions for demonstration purposes.</p>
              </div>
            </TabsContent>
          </Tabs>

          {error && (
            <Alert className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}