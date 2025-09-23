"use client"

import { useToast } from "@/hooks/use-toast"
import { type ToastActionElement } from "@/components/ui/toast"

interface ToastOptions {
  title: string
  description?: string
  variant?: "default" | "destructive" | "success" | "warning"
  duration?: number
  action?: ToastActionElement
}

export function useToastWrapper() {
  const { toast } = useToast()

  const showToast = (options: ToastOptions) => {
    const { title, description, variant = "default", duration = 5000, action } = options
    
    toast({
      title,
      description,
      variant,
      duration,
      action,
    })
  }

  const showErrorToast = (title: string, description?: string) => {
    showToast({
      title,
      description,
      variant: "destructive",
      duration: 7000,
    })
  }

  const showSuccessToast = (title: string, description?: string) => {
    showToast({
      title,
      description,
      variant: "success",
      duration: 5000,
    })
  }

  const showWarningToast = (title: string, description?: string) => {
    showToast({
      title,
      description,
      variant: "warning",
      duration: 5000,
    })
  }

  return {
    showToast,
    showErrorToast,
    showSuccessToast,
    showWarningToast,
  }
}