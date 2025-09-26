"use client"

import type React from "react"

import { useAuth } from "../../lib/auth"
import { AuthForm } from "./auth-form"

export function LoginForm() {
  const { login, loading } = useAuth()

  return <AuthForm type="login" onSubmit={({ email, password }) => login(email, password)} loading={loading} />
}