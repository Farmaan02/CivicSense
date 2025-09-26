"use client"

import type React from "react"

import { useAuth } from "../../lib/auth"
import { AuthForm } from "./auth-form"

export function RegisterForm() {
  const { register, loading } = useAuth()

  return <AuthForm type="register" onSubmit={({ email, password, name }) => register(email, password, name!)} loading={loading} />
}